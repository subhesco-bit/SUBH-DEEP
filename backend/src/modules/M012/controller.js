// Controller for M012 Module — AI Model Performance Ledger
const logger = require('../../utils/logger').logger || console;
const service = require('./service');

async function list(req, res){ try{ const result = await service.listItems({ page: parseInt(req.query.page)||1, limit: parseInt(req.query.limit)||20 }); res.json({ success: true, data: result }); } catch(e){ logger.error('list error', e); res.status(500).json({ success:false, error: e.message }); } }
async function get(req, res){ try{ const item = await service.getItem(req.params.id); if(!item) return res.status(404).json({ success:false, error:'Not found' }); res.json({ success:true, data:item }); }catch(e){ logger.error('get error', e); res.status(500).json({ success:false, error:e.message }); } }
async function create(req, res){ try{ const payload = req.body || {}; const item = await service.createItem(payload); res.status(201).json({ success:true, data:item }); }catch(e){ logger.error('create error', e); res.status(500).json({ success:false, error:e.message }); } }
async function update(req, res){ try{ const payload = req.body || {}; const item = await service.updateItem(req.params.id, payload); if(!item) return res.status(404).json({ success:false, error:'Not found' }); res.json({ success:true, data:item }); }catch(e){ logger.error('update error', e); res.status(500).json({ success:false, error:e.message }); } }
async function remove(req, res){ try{ const ok = await service.deleteItem(req.params.id); if(!ok) return res.status(404).json({ success:false, error:'Not found' }); res.json({ success:true }); }catch(e){ logger.error('delete error', e); res.status(500).json({ success:false, error:e.message }); } }

async function recordCall(req, res){ try{ const item = await service.recordCall(req.body || {}); res.status(201).json({ success:true, data:item }); }catch(e){ logger.error('recordCall error', e); res.status(400).json({ success:false, error:e.message }); } }
async function leaderboard(req, res){ try{ const data = await service.getLeaderboard({ task_type: req.query.task_type || null, limit: parseInt(req.query.limit)||20 }); res.json({ success:true, data }); }catch(e){ logger.error('leaderboard error', e); res.status(500).json({ success:false, error:e.message }); } }
async function modelStats(req, res){ try{ const data = await service.getModelStats(req.params.model_id, { task_type: req.query.task_type || null }); res.json({ success:true, data }); }catch(e){ logger.error('modelStats error', e); res.status(400).json({ success:false, error:e.message }); } }

module.exports = { list, get, create, update, remove, recordCall, leaderboard, modelStats };
