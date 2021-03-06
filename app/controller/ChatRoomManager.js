"use strict";
// import mongodb = require('mongodb');
// import async = require('async');
// import MDb = require('../db/dbClient');
// import Room = require("../model/Room");
// import message = require("../model/Message");
// const ObjectID = mongodb.ObjectID;
// const dbClient = MDb.DbController.DbClient.GetInstance();
// const MongoClient = mongodb.MongoClient;
// export class ChatRoomManager {
//     private static _Instance: ChatRoomManager;
//     private roomDAL = new RoomDataAccess();
//     constructor() {
//         if (ChatRoomManager._Instance) {
//             console.warn("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
//         }
//         ChatRoomManager._Instance = this;
//     }
//     public static getInstance(): ChatRoomManager {
//         if (!ChatRoomManager._Instance) {
//             ChatRoomManager._Instance = new ChatRoomManager();
//         }
//         return ChatRoomManager._Instance;
//     }
//     public GetChatRoomInfo(room_id: string, projection?: any): Promise<any[]> {
//         return new Promise((resolve, reject) => {
//             MongoClient.connect(MDb.DbController.chatDB).then((db: mongodb.Db) => {
//                 let roomColl = db.collection(MDb.DbController.roomColl);
//                 roomColl.find({ _id: new ObjectID(room_id) }).project(projection).limit(1).toArray().then(docs => {
//                     db.close();
//                     resolve(docs);
//                 }).catch(err => {
//                     db.close();
//                     reject(err);
//                 });
//             }).catch(err => {
//                 console.error("Cannot access database, ", err);
//                 reject(err);
//             });
//         });
//     }
//     public getProjectBaseGroups(userId: string, callback: (err, res) => void) {
//         this.roomDAL.findProjectBaseGroups(userId, callback);
//     }
//     public getPrivateGroupChat(uid: string, callback: (err, res) => void) {
//         this.roomDAL.findPrivateGroupChat(uid, callback);
//     }
//     public createPrivateChatRoom(doc, callback: (err, res) => void) {
//         var self = this;
//         var members = new Array<Room.Member>();
//         var _tempArr = doc.members;
//         for (var i in _tempArr) {
//             var user = new Room.Member();
//             user._id = _tempArr[i];
//             members.push(user);
//         }
//         var _room = new Room.Room();
//         _room._id = doc._id;
//         _room.type = Room.RoomType.privateChat;
//         _room.members = members;
//         _room.createTime = new Date();
//         dbClient.InsertDocument(MDb.DbController.roomColl, (err, res) => {
//             if (err) {
//                 console.error("CreatePrivateRoom fail.", err);
//             }
//             else {
//                 callback(null, res[0]);
//             }
//         }, { _id: new ObjectID(_room._id), type: _room.type, members: _room.members, createTime: _room.createTime });
//     }
//     public createPrivateGroup(groupName: string, memberIds: string[], callback: (err, res) => void) {
//         this.roomDAL.createPrivateGroup(groupName, memberIds, callback);
//     }
//     public updateGroupImage(roomId: string, newUrl: string, callback: (err, res) => void) {
//         this.roomDAL.userUpdateGroupImage(roomId, newUrl, callback);
//     }
//     public editGroupMembers(editType: string, roomId: string, members: Room.Member[], callback: (err, res) => void) {
//         if (editType === "add") {
//             this.roomDAL.addGroupMembers(roomId, members, callback);
//         }
//         else if (editType == "remove") {
//             this.roomDAL.removeGroupMembers(roomId, members, callback);
//         }
//     }
//     public editGroupName(roomId: string, newGroupName: string, callback: (err, res) => void) {
//         this.roomDAL.editGroupName(roomId, newGroupName, callback);
//     }
//     public createProjectBaseGroup(groupName: string, members: Room.Member[], callback: (err, res) => void) {
//         this.roomDAL.createProjectBaseGroup(groupName, members, callback);
//     }
//     public editMemberInfoInProjectBase(roomId: string, member: Room.Member, callback: (Error, res) => void) {
//         this.roomDAL.editMemberInfoInProjectBase(roomId, member, callback);
//     }
//     /*
//     * Require 
//     *@roomId for query chat record in room.
//     *@lastAccessTime for query only message who newer than lastAccessTime.
//     */
//     public getNewerMessageOfChatRoom(roomId: string, isoDate: Date, callback: (err, res) => void) {
//         MongoClient.connect(MDb.DbController.chatDB).then(db => {
//             // Get the documents collection
//             let collection = db.collection(MDb.DbController.messageColl);
//             // Create an index on the a field
//             collection.createIndex({ rid: 1, createTime: 1 }, { background: true, w: 1 }).then(function (indexName) {
//                 // Find some documents
//                 collection.find({ rid: roomId, createTime: { $gt: new Date(isoDate.toISOString()) } })
//                     .limit(100).sort({ createTime: 1 }).toArray(function (err, docs) {
//                         if (err) {
//                             callback(new Error(err.message), docs);
//                         }
//                         else {
//                             callback(null, docs);
//                         }
//                         db.close();
//                     });
//             }).catch(function (err) {
//                 db.close();
//                 console.error("Create index fail.", err);
//             });
//         }).catch(err => {
//             console.error("Cannot connect database", err);
//         });
//     }
//     public getOlderMessageChunkOfRid(rid: string, topEdgeMessageTime: string, callback: (err, res) => void) {
//         let utc = new Date(topEdgeMessageTime);
//         MongoClient.connect(MDb.DbController.chatDB, function (err, db) {
//             if (err) { return console.dir(err); }
//             // Get the documents collection
//             var collection = db.collection(MDb.DbController.messageColl);
//             // Find some documents
//             collection.find({ rid: rid, createTime: { $lt: new Date(utc.toISOString()) } }).limit(100).sort({ createTime: -1 }).toArray(function (err, docs) {
//                 if (err) {
//                     callback(new Error(err.message), docs);
//                 }
//                 else {
//                     callback(null, docs);
//                 }
//                 db.close();
//             });
//         });
//     }
//     public updateChatRecordContent(messageId: string, content: string, callback: (err, res) => void) {
//         dbClient.UpdateDocument(MDb.DbController.messageColl, (res) => {
//             callback(null, res);
//         }, { _id: new ObjectID(messageId) }, { $set: { body: content } });
//     }
//     public updateWhoReadMessage(messageId: string, uid: string, callback: (err, res) => void) {
//         this.roomDAL.updateWhoReadMessage(messageId, uid, callback);
//     }
//     /*
//     * Get last limit query messages of specific user and room then return messages info. 
//     */
//     public getMessagesReaders(userId: string, roomId: string, topEdgeMessageTime: string, callback: (err, res) => void) {
//         let utc = new Date(topEdgeMessageTime);
//         MongoClient.connect(MDb.DbController.chatDB, function (err, db) {
//             if (err) {
//                 return console.error(err);
//             }
//             // Get the documents collection
//             let collection = db.collection(MDb.DbController.messageColl);
//             // Create an index on the a field
//             collection.createIndex({ rid: 1, sender: 1, createTime: 1 }, { background: true, w: 1 }, function (err, indexName) {
//                 if (err) {
//                     db.close();
//                     return console.error("Create index fail.", err);
//                 }
//                 // Find some documents
//                 collection.find({ rid: roomId, sender: userId, createTime: { $gt: new Date(utc.toISOString()) } })
//                     .project({ readers: 1 }).sort({ createTime: -1 }).toArray(function (err, docs) {
//                         if (!docs || err) {
//                             callback(new Error("getMessagesInfoOfUserXInRoomY is no response."), err);
//                         }
//                         else {
//                             console.log("getMessagesReaders found the following records", docs.length);
//                             callback(null, docs);
//                         }
//                         db.close();
//                     });
//             });
//         });
//     }
//     /**
//      * Require: message_id.
//      * **************************
//      * Return: sender of target message.
//      * Return: reader fields of target messageId.
//      */
//     public getWhoReadMessage(messageId: string, callback: (err, res) => void) {
//         this.roomDAL.getWhoReadMessage(messageId, callback);
//     }
//     public GetChatContent(messageId: string, callback: (err, res: any[]) => void) {
//         MongoClient.connect(MDb.DbController.chatDB, function (err, db) {
//             if (err) { return console.dir(err); }
//             // Get the documents collection
//             var collection = db.collection(MDb.DbController.messageColl);
//             // Find some documents
//             collection.find({ _id: new ObjectID(messageId) }).toArray((err: Error, results: any[]) => {
//                 callback(err, results);
//                 db.close();
//             });
//         });
//     }
//     public getUnreadMsgCountAndLastMsgContentInRoom(roomId: string, lastAccessTime: string, callback: Function) {
//         let self = this;
//         let isoDate = new Date(lastAccessTime).toISOString();
//         // Use connect method to connect to the Server
//         MongoClient.connect(MDb.DbController.chatDB).then(db => {
//             // Get the documents collection
//             let collection = db.collection(MDb.DbController.messageColl);
//             collection.createIndex({ rid: 1, createTime: 1 }, { background: true, w: 1 }).then(indexName => {
//                 collection.find({ rid: roomId.toString(), createTime: { $gt: new Date(isoDate) } })
//                     .project({ _id: 1 }).sort({ createTime: 1 }).toArray().then(docs => {
//                         db.close();
//                         if (docs.length > 0) {
//                             self.roomDAL.getLastMsgContentInMessagesIdArray(docs, function (err, res) {
//                                 if (!!res) {
//                                     callback(null, { count: docs.length, message: res });
//                                 }
//                                 else {
//                                     callback(null, { count: docs.length });
//                                 }
//                             });
//                         }
//                         else {
//                             self.roomDAL.getLastMessageContentOfRoom(roomId, function (err, res) {
//                                 if (!!res) {
//                                     callback(null, { count: docs.length, message: res });
//                                 }
//                                 else {
//                                     callback(null, { count: docs.length });
//                                 }
//                             });
//                         }
//                     }).catch(err => {
//                         db.close();
//                         callback(new Error("GetUnreadMsgOfRoom by query date is no response."), null);
//                     });
//             }).catch(err => {
//                 db.close();
//                 console.error("createIndex fail...");
//             });
//         }).catch(err => {
//             console.error("Cannot connect database.");
//         });
//     }
// }
// class RoomDataAccess {
//     findProjectBaseGroups(userId: string, callback: (err, res) => void) {
//         dbClient.FindDocuments(MDb.DbController.roomColl, function (res) {
//             callback(null, res);
//         }, { type: Room.RoomType.projectBaseGroup, status: Room.RoomStatus.active, members: { $elemMatch: { id: userId } } });
//     }
//     findPrivateGroupChat(uid: string, callback: (err, res) => void) {
//         dbClient.FindDocuments(MDb.DbController.roomColl, function (res) {
//             callback(null, res);
//         }, { type: Room.RoomType.privateGroup, members: { $elemMatch: { id: uid } } });
//     }
//     /**
//     * return : =>
//     * unread msgs count.
//     * type of msg, 
//     * msg.body
//     */
//     public getLastMsgContentInMessagesIdArray(docs: any[], callback: Function) {
//         var lastDoc = docs[docs.length - 1];
//         // Use connect method to connect to the Server
//         MongoClient.connect(MDb.DbController.chatDB, function (err, db) {
//             if (err) { return console.dir(err); }
//             // Get the documents collection
//             let collection = db.collection(MDb.DbController.messageColl);
//             // Find some documents
//             collection.find({ _id: new ObjectID(lastDoc._id) }).limit(1).toArray(function (err, docs) {
//                 if (!docs) {
//                     callback(new Error("getLastMsgContentInMessagesIdArray error."), docs);
//                 }
//                 else {
//                     callback(null, docs[0]);
//                 }
//                 db.close();
//             });
//         });
//     }
//     public getLastMessageContentOfRoom(rid: string, callback: Function) {
//         // Use connect method to connect to the Server
//         MongoClient.connect(MDb.DbController.chatDB, function (err, db) {
//             if (err) { return console.dir(err); }
//             // Get the documents collection
//             let collection = db.collection(MDb.DbController.messageColl);
//             collection.createIndex({ rid: 1 }, { background: true, w: 1 }).then(indexName => {
//                 // Find newest message documents
//                 collection.find({ rid: rid.toString() }).sort({ createTime: -1 }).limit(1).toArray(function (err, docs) {
//                     if (!docs || err) {
//                         callback(err, null);
//                     }
//                     else {
//                         callback(null, docs[0]);
//                     }
//                     db.close();
//                 });
//             }).catch(err => {
//                 db.close();
//                 console.error("Create index fail.", err);
//             });
//         });
//     }
//     public createPrivateGroup(groupName: string, memberIds: string[], callback: (err, res) => void) {
//         var self = this;
//         var members: Array<Room.Member> = new Array<Room.Member>();
//         memberIds.forEach((val, id, arr) => {
//             var member: Room.Member = new Room.Member();
//             member._id = val;
//             members.push(member);
//         });
//         var newRoom = new Room.Room();
//         newRoom.name = groupName;
//         newRoom.type = Room.RoomType.privateGroup;
//         newRoom.members = members;
//         newRoom.createTime = new Date();
//         dbClient.InsertDocument(MDb.DbController.roomColl, function (err, docs) {
//             console.log("Create new group to db.", docs.length);
//             if (docs !== null) {
//                 callback(null, docs);
//             }
//             else {
//                 callback(new Error("cannot insert new group to db collection."), null);
//             }
//         }, newRoom);
//     }
//     public createProjectBaseGroup(groupName: string, members: Room.Member[], callback: (err, res) => void) {
//         var newRoom = new Room.Room();
//         newRoom.name = groupName;
//         newRoom.type = Room.RoomType.projectBaseGroup;
//         newRoom.members = members;
//         newRoom.createTime = new Date();
//         newRoom.status = Room.RoomStatus.active;
//         newRoom.nodeId = 0;
//         MongoClient.connect(MDb.DbController.chatDB, function (err, db) {
//             if (err) { return console.dir(err); }
//             // Get the documents collection
//             var collection = db.collection(MDb.DbController.roomColl);
//             // Find some documents
//             collection.insertOne(newRoom, (err, result) => {
//                 callback(err, result.ops);
//                 db.close();
//             });
//         });
//     }
//     public userUpdateGroupImage(roomId: string, newUrl: string, callback: (err, res) => void) {
//         var self = this;
//         dbClient.UpdateDocument(MDb.DbController.roomColl, function (res) {
//             callback(null, res);
//         }, { _id: new ObjectID(roomId) }, { $set: { image: newUrl } }, { w: 1, upsert: true });
//     }
//     public addGroupMembers(roomId: string, members: Room.Member[], callback: (err, res) => void) {
//         MongoClient.connect(MDb.DbController.chatDB, function (err, db) {
//             if (err) { return console.dir(err); }
//             // Get the documents collection
//             var collection = db.collection(MDb.DbController.roomColl);
//             // Find some documents
//             collection.updateOne({ _id: new ObjectID(roomId) }, { $push: { members: { $each: members } } }, function (err, result) {
//                 if (err) {
//                     callback(new Error(err.message), null);
//                 }
//                 else {
//                     callback(null, result);
//                 }
//                 db.close();
//             });
//         });
//     }
//     public removeGroupMembers(roomId: string, members: Room.Member[], callback: (err, res) => void) {
//         async.eachSeries(members, function iterator(item, errCb) {
//             MongoClient.connect(MDb.DbController.chatDB, function (err, db) {
//                 if (err) { return console.dir(err); }
//                 // Get the documents collection
//                 var collection = db.collection(MDb.DbController.roomColl);
//                 // Find some documents
//                 collection.updateOne({ _id: new ObjectID(roomId) }, { $pull: { members: { id: item._id } } }, function (err, result) {
//                     if (err) {
//                         errCb(new Error(err.message));
//                     }
//                     else {
//                         errCb();
//                     }
//                     db.close();
//                 });
//             });
//         }, (err: Error) => {
//             if (err) {
//                 console.error('removeGroupMembers has a problem!', err.message);
//                 callback(err, null);
//             }
//             else {
//                 callback(null, "removeGroupMembers success.");
//             }
//         });
//     }
//     public editGroupName(roomId: string, newGroupName: string, callback: (err, res) => void) {
//         MongoClient.connect(MDb.DbController.chatDB, function (err, db) {
//             if (err) { return console.dir(err); }
//             // Get the documents collection
//             var collection = db.collection(MDb.DbController.roomColl);
//             // Find some documents
//             collection.updateOne({ _id: new ObjectID(roomId) }, { $set: { name: newGroupName } }, function (err, result) {
//                 if (err) {
//                     callback(new Error(err.message), null);
//                 }
//                 else {
//                     callback(null, result);
//                 }
//                 db.close();
//             });
//         });
//     }
//     public editMemberInfoInProjectBase(roomId: string, member: Room.Member, callback: (err, res) => void) {
//         MongoClient.connect(MDb.DbController.chatDB, (err, db) => {
//             // Get the collection
//             var col = db.collection(MDb.DbController.roomColl);
//             col.updateOne({ _id: new ObjectID(roomId), "members.id": member._id }, { $set: { "members.$": member } }, function (err, result) {
//                 callback(null, result);
//                 // Finish up test
//                 db.close();
//             });
//         });
//     }
//     public updateWhoReadMessage(messageId: string, uid: string, callback: (err, res) => void) {
//         dbClient.UpdateDocument(MDb.DbController.messageColl, function (res2) {
//             if (!res2) {
//                 callback(new Error("updateChatRecordWhoRead fail."), null);
//             }
//             else {
//                 callback(null, res2);
//             }
//         }, { _id: new ObjectID(messageId) }, { $addToSet: { readers: uid } });
//     }
//     /*
//      * Require: message_id.
//      * **************************
//      * Return: reader fields of target messageId.
//      */
//     public getWhoReadMessage(messageId: string, callback: (err, res) => void) {
//         dbClient.FindDocument(MDb.DbController.messageColl, (result) => {
//             if (!result) {
//                 callback(new Error("getWhoReadMessage fail."), null);
//             }
//             else {
//                 callback(null, result);
//             }
//         },
//             { _id: new ObjectID(messageId) },
//             { sender: 1, readers: 1 });
//     }
// }
// */
