import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
    console.error(
        'Supabase is not configured: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are missing. ' +
        'Calling features will be unavailable. Add them to frontend/.env.local.'
    );
}

// Lazily create a single supabase client. We must NOT call createClient at
// module load with empty strings: supabase-js throws "supabaseUrl is required."
// on a falsy url, which would crash app startup whenever the env vars are
// missing (the whole module graph imports this transitively). Creating it on
// first use lets the isSupabaseConfigured guards degrade gracefully instead.
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
    if (!isSupabaseConfigured) {
        throw new Error(
            'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.local.'
        );
    }
    if (!supabaseClient) {
        supabaseClient = createClient(supabaseUrl as string, supabaseKey as string);
    }
    return supabaseClient;
}

type SignalingCallback = (payload: any) => void;

class SupabaseSignalingService {
    private channel: RealtimeChannel | null = null;
    private currentUserId: string | null = null;
    private callbacks: Record<string, SignalingCallback[]> = {};

    /**
     * Initializes the signaling channel and sets the current user id
     * (needed to filter messages meant for this client).
     */
    initialize(userId: string) {
        if (!isSupabaseConfigured) {
            throw new Error(
                'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.local.'
            );
        }
        this.currentUserId = userId;
        if (this.channel) return;

        this.channel = getSupabaseClient().channel('webrtc-signaling');
        this.channel
            .on('broadcast', { event: 'message' }, (payload) => {
                this.handleIncomingMessage(payload.payload);
            })
            .subscribe((status) => {
                console.log('Supabase realtime status:', status);
            });
    }

    /**
     * Leaves the channel and cleans up
     */
    disconnect() {
        if (this.channel) {
            getSupabaseClient().removeChannel(this.channel);
            this.channel = null;
        }
        this.currentUserId = null;
    }

    /**
     * Subscribe to specific event types (e.g. "call_answer", "call_rejected")
     */
    on(eventType: string, callback: SignalingCallback) {
        if (!this.callbacks[eventType]) {
            this.callbacks[eventType] = [];
        }
        this.callbacks[eventType].push(callback);
    }

    /**
     * Unsubscribe
     */
    off(eventType: string, callback: SignalingCallback) {
        if (!this.callbacks[eventType]) return;
        this.callbacks[eventType] = this.callbacks[eventType].filter(cb => cb !== callback);
    }

    /**
     * Internal message handler
     */
    private handleIncomingMessage(wrapper: any) {
        // We only process messages addressed to this specific user
        if (!wrapper || !wrapper.targetUserId || wrapper.targetUserId !== this.currentUserId) {
            return;
        }

        const type = wrapper.type;
        let innerPayload = {};
        try {
            if (wrapper.payload) {
                innerPayload = JSON.parse(wrapper.payload);
            }
        } catch (e) {
            console.error("Failed to parse inner payload", e);
        }

        if (type && this.callbacks[type]) {
            this.callbacks[type].forEach(cb => cb(innerPayload));
        }
    }

    /**
     * Broadcasts a call offer to the target TV User.
     */
    async sendCallOffer(targetUserId: string, callerId: string, callerName: string) {
        if (!this.channel) throw new Error('Signaling service not initialized');

        // The TV App expects these exact fields in the inner payload
        const innerPayload = {
            callerId,
            callerUserId: callerId, // some redundancies required by TV App
            callerName,
            callerUsername: callerName, // TV App's CallOffer requires this (non-optional) or it fails to deserialize the offer
            sdp: "dummy_sdp_offer_data",
            mediaType: "audio_video"
        };

        const wrapper = {
            targetUserId,
            type: "call_offer",
            payload: JSON.stringify(innerPayload)
        };

        await this.channel.send({
            type: 'broadcast',
            event: 'message',
            payload: wrapper
        });
    }

    /**
     * Broadcasts a call ended event to cancel an actively ringing outbound call.
     */
    async sendCallEnded(targetUserId: string, reason: string = "caller_cancelled") {
        if (!this.channel) return;

        const innerPayload = {
            reason,
            duration: 0
        };

        const wrapper = {
            targetUserId,
            type: "call_ended",
            payload: JSON.stringify(innerPayload)
        };

        await this.channel.send({
            type: 'broadcast',
            event: 'message',
            payload: wrapper
        });
    }
}

// Export singleton instance
export const signalingService = new SupabaseSignalingService();