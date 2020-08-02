/* eslint-disable max-len */
const EventModel = require('../../models/events/events.model');
// import EventModel from '../index';

exports.insert = (req, res) => {
  EventModel.saveEvent(req.body)
      .then((result) => {
        res.status(201).send({id: result._id});
      });
};

exports.list = (req, res) => {
  const limit = req.query.limit &&
  req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
  let page = 0;
  if (req.query) {
    if (req.query.page) {
      req.query.page = parseInt(req.query.page);
      page = Number.isInteger(req.query.page) ? req.query.page : 0;
    }
  }
  EventModel.list(limit, page)
      .then((result) => {
        res.status(200).send(result);
      });
};
