export type DonationRequestStatus = 'open' | 'cancelled';
export type DonorResponseStatus = 'accepted' | 'declined';

export type DonationRequest = {
  id: string;
  patientId: string;
  requestedBloodGroup: string;
  compatibleDonorGroups: string[];
  status: DonationRequestStatus;
};

export type DonationResponse = {
  donorId: string;
  response: DonorResponseStatus;
};
