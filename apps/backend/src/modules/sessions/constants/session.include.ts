export const SESSION_INCLUDE = {
  candidate: {
    select: { id: true, name: true, email: true, roleApplyingFor: true },
  },
  interviewer: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  room: {
    select: { id: true, name: true },
  },
};
