// Merges new entities into the existing state
// export const mergeEntities = (entityState, newEntities) => {
//   Object.assign(entityState.byId, newEntities.byId);
//   entityState.allIds = Array.from(new Set([...entityState.allIds, ...newEntities.allIds]));
// };
export const mergeEntities = (entityState, newEntities) => {
  Object.assign(entityState.byId, newEntities.byId);
  entityState.allIds = newEntities.allIds ? Array.from(new Set([...entityState.allIds, ...newEntities.allIds])) : entityState.allIds;
};


// // Adds a new entity to the state
// export const addEntity = (entityState, entity) => {
//   entityState.byId[entity.id] = entity;
//   if (!entityState.allIds.includes(entity.id)) {
//     entityState.allIds.push(entity.id);
//   }
// };
// Example of addEntity function
export const addEntity = (entityState, entity) => {
  console.log("--Entity received in addEntity:", entity);
  if (entity && entity.id) {
    entityState.byId[entity.id] = entity;
    if (!entityState.allIds.includes(entity.id)) {
      entityState.allIds.push(entity.id);
    }
  } else {
    console.error("Invalid entity data received:", entity);
  }
};


// Removes an entity from the state
export const removeEntity = (entityState, entityId) => {
  delete entityState.byId[entityId];
  entityState.allIds = entityState.allIds.filter(id => id !== entityId);
};
