import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { signalingService } from '../../services/SupabaseSignalingService';
import { getUserInfo } from '../../auth/AuthService';

export type CallState = 'Idle' | 'Calling' | 'Ringing' | 'Accepted' | 'Declined' | 'Ended' | 'Failed';

interface CallModalProps {
  show: boolean;
  onHide: () => void;
  targetSupabaseProfileId?: string | null;
  patientName: string;
}

const CallModal: React.FC<CallModalProps> = ({ show, onHide, targetSupabaseProfileId, patientName }) => {
  const [callState, setCallState] = useState<CallState>('Idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Mirror callState in a ref so the signaling listeners (registered once per
  // open) always read the latest value without relying on a stale closure.
  const callStateRef = useRef<CallState>(callState);
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  const userInfo = getUserInfo();

  useEffect(() => {
    if (!show) return;

    // Listen for call answers
    const onCallAnswer = (payload: any) => {
      console.log('Call answered:', payload);
      setCallState('Accepted');
    };

    // Listen for call rejections
    const onCallRejected = (payload: any) => {
      console.log('Call rejected:', payload);
      setCallState('Declined');
      setErrorMessage(payload?.reason || 'Pasienten avviste anropet.');
    };

    // Listen for call endings
    const onCallEnded = (payload: any) => {
      console.log('Call ended:', payload);
      const previous = callStateRef.current;
      setCallState('Ended');
      if (previous !== 'Accepted' && previous !== 'Declined') {
        setErrorMessage(payload?.reason || 'Anropet ble avsluttet.');
      }
    };

    // Register listeners BEFORE sending the offer so a fast answer/rejection
    // from the TV can't arrive before we're listening for it.
    signalingService.on('call_answer', onCallAnswer);
    signalingService.on('call_rejected', onCallRejected);
    signalingService.on('call_ended', onCallEnded);

    // Reset state when modal opens, then place the call.
    setCallState('Calling');
    setErrorMessage('');
    initiateCall();

    return () => {
      signalingService.off('call_answer', onCallAnswer);
      signalingService.off('call_rejected', onCallRejected);
      signalingService.off('call_ended', onCallEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const initiateCall = async () => {
    if (!targetSupabaseProfileId) {
      setCallState('Failed');
      setErrorMessage('Pasienten har ikke en gyldig TV-profil (Supabase ID) koblet til seg.');
      return;
    }

    if (!userInfo || !userInfo.userId) {
      setCallState('Failed');
      setErrorMessage('Kunne ikke hente din brukerinformasjon.');
      return;
    }

    try {
      // Ensure signaling is initialized
      signalingService.initialize(userInfo.userId);

      // Send the offer
      await signalingService.sendCallOffer(
        targetSupabaseProfileId,
        userInfo.userId,
        userInfo.fullName || 'Helsepersonell'
      );

      // Wait a moment before showing "Ringing" state
      setTimeout(() => {
        setCallState(current => current === 'Calling' ? 'Ringing' : current);
      }, 1500);

    } catch (e) {
      console.error('Anrop feilet:', e);
      setCallState('Failed');
      setErrorMessage('En systemfeil oppstod ved forsøk på å ringe pasienten.');
    }
  };

  const handleClose = async () => {
    // Notify the TV whenever we close while a call is still live: cancel a
    // ringing call, or hang up an accepted one. Already-terminated states
    // (Declined/Ended/Failed) need no further signal.
    const isLive = callState === 'Calling' || callState === 'Ringing' || callState === 'Accepted';
    if (isLive && targetSupabaseProfileId) {
      const reason = callState === 'Accepted' ? 'caller_hung_up' : 'caller_cancelled';
      try {
        await signalingService.sendCallEnded(targetSupabaseProfileId, reason);
      } catch (e) {
        console.warn('Failed to send call_ended', e);
      }
    }
    // Tear down the realtime subscription so it doesn't linger after the modal
    // closes; it is re-initialized on the next call.
    signalingService.disconnect();
    setCallState('Idle');
    onHide();
  };

  const renderContent = () => {
    switch (callState) {
      case 'Failed':
      case 'Declined':
      case 'Ended':
        return (
          <div className="text-center py-4">
            <i className={`bi display-1 mb-3 ${callState === 'Failed' ? 'bi-x-circle text-danger' : 'bi-telephone-x text-warning'}`}></i>
            <h4 className="mb-3">{callState === 'Failed' ? 'Anrop feilet' : 'Anrop avsluttet/avvist'}</h4>
            <Alert variant={callState === 'Failed' ? 'danger' : 'warning'}>{errorMessage}</Alert>
          </div>
        );
      
      case 'Accepted':
        return (
          <div className="text-center py-4">
            <i className="bi bi-telephone-fill text-success display-1 mb-3"></i>
            <h4 className="text-success mb-3">Anrop pågår!</h4>
            <p className="text-muted">Aktiv videosamtale simuleres... (Dummy POC flow)</p>
          </div>
        );

      case 'Calling':
      case 'Ringing':
      default:
        return (
          <div className="text-center py-4">
            <Spinner animation="grow" variant="primary" className="mb-4" style={{ width: '4rem', height: '4rem' }} />
            <h4>{callState === 'Calling' ? 'Kobler opp...' : `Ringer ${patientName}...`}</h4>
            <p className="text-muted mt-2">Venter på svar fra TV-skjermen...</p>
          </div>
        );
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Anrop til pasient</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {renderContent()}
      </Modal.Body>
      <Modal.Footer>
        {(callState === 'Calling' || callState === 'Ringing') ? (
          <Button variant="danger" onClick={handleClose} className="w-100 py-2 fw-semibold">
            Legg på
          </Button>
        ) : callState === 'Accepted' ? (
          <Button variant="danger" onClick={handleClose} className="w-100 py-2 fw-semibold">
            Avslutt samtale
          </Button>
        ) : (
          <Button variant="secondary" onClick={handleClose} className="w-100 py-2">
            Lukk vindu
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CallModal;