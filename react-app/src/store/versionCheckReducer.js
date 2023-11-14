const VERSION_CHECK_COMPLETE = 'VERSION_CHECK_COMPLETE';

export const versionCheckComplete = () => ({
  type: VERSION_CHECK_COMPLETE,
});

const versionCheckReducer = (state = { isComplete: false }, action) => {
  switch (action.type) {
    case VERSION_CHECK_COMPLETE:
      return { ...state, isComplete: true };
    default:
      return state;
  }
};

export default versionCheckReducer;
