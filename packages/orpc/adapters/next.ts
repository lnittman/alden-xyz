import { appRouter } from '../router';

// Direct exports of router procedures - following Arbor pattern
// The procedures already have .actionable() called in the router definition

// Board server actions
export const createBoardAction = appRouter.board.create;
export const updateBoardAction = appRouter.board.update;
export const deleteBoardAction = appRouter.board.delete;
export const addBoardCollaboratorAction = appRouter.board.addCollaborator;
export const removeBoardCollaboratorAction = appRouter.board.removeCollaborator;
export const addAssetToBoardAction = appRouter.board.addAssetToBoard;
export const removeAssetFromBoardAction = appRouter.board.removeAssetFromBoard;

// Asset server actions
export const createAssetAction = appRouter.asset.create;
export const updateAssetAction = appRouter.asset.update;
export const deleteAssetAction = appRouter.asset.delete;
export const likeAssetAction = appRouter.asset.like;
export const trackAssetViewAction = appRouter.asset.trackView;
export const trackAssetUseAction = appRouter.asset.trackUse;

// User server actions
export const updateUserAction = appRouter.user.update;
export const deleteUserAction = appRouter.user.delete;
