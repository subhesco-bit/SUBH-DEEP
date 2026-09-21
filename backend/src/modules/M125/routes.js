'use strict';
const express = require('express');
const controller = require('./controller');
const { protectLivestockRouter } = require('../../routes/livestockRouteSupport');
const router = express.Router();
protectLivestockRouter(router, { requireWriteRole: true });
router.get('/', controller.list); router.get('/:id', controller.get);
router.post('/', controller.create); router.put('/:id', controller.update); router.delete('/:id', controller.remove);
module.exports = router;
