const dataAccessAdapter = require('../db/dataAccessAdapter');

class Model {
  constructor(dbName, collectionName) {
    this.collection = dataAccessAdapter.ConnectToCollection(
      dbName,
      collectionName
    );
  }

  find(query, filter = {}) {
    const pipeline = [
      {
        $facet: {
          paginatedResults: [
            { $match: query },
            { $skip: filter.skip },
            { $limit: filter.limit },
          ]
        },
      },
    ];
    return this.collection.aggregate(pipeline);

  }

  findOne(query) {
    return this.collection.findOne(query);
  }

  // insertOne(data) {
  //   return this.collection.insertOne(data);
  // }

  bulkWrite(data) {
    return this.collection.bulkWrite(data);
  }

  // updateOne(query, data) {
  //   return this.collection.updateOne(query, data);
  // }

  aggregate(query) {
    return this.collection.aggregate(query);
  }

  replaceOne(query, data) {
    return this.collection.replaceOne(query, data);
  }

  deleteOne(query) {
    return this.collection.deleteOne(query);
  }

  countDocuments(query, options) {
    return this.collection.countDocuments(query, options);
  }

  stats() {
    const pipeline = [
      {
        $collStats: {
          latencyStats: { histograms: true },
          storageStats: { scale: 1 },
          count: {},
          queryExecStats: {}
        }
      }
    ];
    return this.collection.aggregate(pipeline).toArray();
  }
}

module.exports = Model;
