"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var twitter_api_v2_1 = require("twitter-api-v2");
var client_1 = require("@prisma/client");
var telegram_1 = require("telegram");
var sessions_1 = require("telegram/sessions");
var toad_scheduler_1 = require("toad-scheduler");
var prisma = new client_1.PrismaClient();
var client = new twitter_api_v2_1.TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY,
    appSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});
var apiId = parseInt(process.env.API_ID);
var apiHash = process.env.API_HASH;
var stringSession = new sessions_1.StringSession(process.env.SESSION);
var tgClient = new telegram_1.TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});
(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, tgClient.connect()];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); })();
var id = "2528783778";
// let name: string, id: string, followers_count: number, friends_count: number;
// (async () => {
//   const user = await client.currentUser();
//   //console.log(user);
//   name = user.name;
//   id = user.id_str;
//   followers_count = user.followers_count;
//   friends_count = user.friends_count;
// })();
//const summary = `${name} (id: ${id}) has ${followers_count} followers and is following ${friends_count} accounts.`;
//console.log(summary);
function newFollowers(currentFollower) {
    return __awaiter(this, void 0, void 0, function () {
        var info;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.follower
                        .findUnique({
                        where: {
                            userId: currentFollower.id,
                        },
                    })
                        .catch(function (e) { return console.log(e); })];
                case 1:
                    info = _a.sent();
                    if (!(info === null)) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma.follower
                            .create({
                            data: {
                                userId: currentFollower.id,
                                name: currentFollower.name,
                                username: currentFollower.username,
                            },
                        })
                            .then(function () { return __awaiter(_this, void 0, void 0, function () {
                            var text;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        text = "New follower: ".concat(currentFollower.name, " (https://twitter.com/").concat(currentFollower.username, ")");
                                        console.log(text);
                                        return [4 /*yield*/, tgClient
                                                .sendMessage("me", {
                                                message: text,
                                                linkPreview: false,
                                                parseMode: "html",
                                            })
                                                .catch(function (e) { return console.log(e); })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .catch(function (e) { return console.log(e); })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function newFollowing(currentFollowing) {
    return __awaiter(this, void 0, void 0, function () {
        var info;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.following
                        .findUnique({
                        where: {
                            userId: currentFollowing.id,
                        },
                    })
                        .catch(function (e) { return console.log(e); })];
                case 1:
                    info = _a.sent();
                    if (!(info === null)) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma.following
                            .create({
                            data: {
                                userId: currentFollowing.id,
                                name: currentFollowing.name,
                                username: currentFollowing.username,
                            },
                        })
                            .then(function () { return __awaiter(_this, void 0, void 0, function () {
                            var text;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        text = "Now following: ".concat(currentFollowing.name, " (https://twitter.com/").concat(currentFollowing.username, ")");
                                        console.log(text);
                                        return [4 /*yield*/, tgClient
                                                .sendMessage("me", {
                                                message: text,
                                                linkPreview: false,
                                                parseMode: "html",
                                            })
                                                .catch(function (e) { return console.log(e); })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .catch(function (e) { return console.log(e); })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function trackUnfollows(idList) {
    return __awaiter(this, void 0, void 0, function () {
        var badPeople, i, f, text;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.follower
                        .findMany({
                        where: {
                            userId: {
                                notIn: idList,
                            },
                        },
                    })
                        .catch(function (e) { return console.log(e); })
                        .finally(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, prisma.$disconnect()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    badPeople = _a.sent();
                    if (!(badPeople && badPeople.length > 0)) return [3 /*break*/, 7];
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < badPeople.length)) return [3 /*break*/, 7];
                    f = badPeople[i];
                    text = "".concat(f.name, " (https://twitter.com/").concat(f.username, ") unfollowed you.");
                    return [4 /*yield*/, tgClient
                            .sendMessage("me", {
                            message: text,
                            linkPreview: false,
                            parseMode: "html",
                        })
                            .catch(function (e) { return console.log(e); })];
                case 3:
                    _a.sent();
                    console.log(text);
                    console.log(f);
                    // borrar de la base de datos
                    return [4 /*yield*/, prisma.follower
                            .delete({
                            where: {
                                userId: f.userId,
                            },
                        })
                            .then(function () {
                            console.log("Deleted");
                        })
                            .catch(function (e) { return console.log(e); })];
                case 4:
                    // borrar de la base de datos
                    _a.sent();
                    return [4 /*yield*/, prisma.deleted
                            .create({
                            data: {
                                userId: f.userId,
                            },
                        })
                            .catch(function () {
                            return console.log("No se pudo agregar a los Eliminados, probablemente ya exista");
                        })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 2];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function trackUnfollowings(idList) {
    return __awaiter(this, void 0, void 0, function () {
        var badPeople, i, f, text;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.following
                        .findMany({
                        where: {
                            userId: {
                                notIn: idList,
                            },
                        },
                    })
                        .catch(function (e) { return console.log(e); })
                        .finally(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, prisma.$disconnect()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    badPeople = _a.sent();
                    if (!(badPeople && badPeople.length > 0)) return [3 /*break*/, 6];
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < badPeople.length)) return [3 /*break*/, 6];
                    f = badPeople[i];
                    text = "You stop following ".concat(f.name, " (https://twitter.com/").concat(f.username, ").");
                    return [4 /*yield*/, tgClient
                            .sendMessage("me", {
                            message: text,
                            linkPreview: false,
                            parseMode: "html",
                        })
                            .catch(function (e) { return console.log(e); })];
                case 3:
                    _a.sent();
                    console.log(text);
                    console.log(f);
                    // borrar de la base de datos
                    return [4 /*yield*/, prisma.following
                            .delete({
                            where: {
                                userId: f.userId,
                            },
                        })
                            .then(function () {
                            console.log("Deleted");
                        })
                            .catch(function (e) { return console.log(e); })];
                case 4:
                    // borrar de la base de datos
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 2];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function comparison() {
    return __awaiter(this, void 0, void 0, function () {
        var followerCount, followingCount, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.follower
                        .count()
                        .catch(function (e) { return console.log(e); })];
                case 1:
                    followerCount = _a.sent();
                    return [4 /*yield*/, prisma.following
                            .count()
                            .catch(function (e) { return console.log(e); })];
                case 2:
                    followingCount = _a.sent();
                    text = "Followers: ".concat(followerCount, "\nFollowing: ").concat(followingCount);
                    console.log(text);
                    return [4 /*yield*/, tgClient
                            .sendMessage("me", { message: text })
                            .catch(function (e) { return console.log(e); })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function followersLoop() {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function () {
        var idList, followers, followers_1, followers_1_1, follower, e_1_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    idList = [];
                    return [4 /*yield*/, client.v2.followers(id, { asPaginator: true })];
                case 1:
                    followers = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 8, 9, 14]);
                    followers_1 = __asyncValues(followers);
                    _b.label = 3;
                case 3: return [4 /*yield*/, followers_1.next()];
                case 4:
                    if (!(followers_1_1 = _b.sent(), !followers_1_1.done)) return [3 /*break*/, 7];
                    follower = followers_1_1.value;
                    idList.push(follower.id);
                    return [4 /*yield*/, newFollowers(follower)];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6: return [3 /*break*/, 3];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _b.trys.push([9, , 12, 13]);
                    if (!(followers_1_1 && !followers_1_1.done && (_a = followers_1.return))) return [3 /*break*/, 11];
                    return [4 /*yield*/, _a.call(followers_1)];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14: return [4 /*yield*/, trackUnfollows(idList)];
                case 15:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function followingloop() {
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function () {
        var idList, iAmFollowing, iAmFollowing_1, iAmFollowing_1_1, following, e_2_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    idList = [];
                    return [4 /*yield*/, client.v2.following(id, { asPaginator: true })];
                case 1:
                    iAmFollowing = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 8, 9, 14]);
                    iAmFollowing_1 = __asyncValues(iAmFollowing);
                    _b.label = 3;
                case 3: return [4 /*yield*/, iAmFollowing_1.next()];
                case 4:
                    if (!(iAmFollowing_1_1 = _b.sent(), !iAmFollowing_1_1.done)) return [3 /*break*/, 7];
                    following = iAmFollowing_1_1.value;
                    idList.push(following.id);
                    return [4 /*yield*/, newFollowing(following)];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6: return [3 /*break*/, 3];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _b.trys.push([9, , 12, 13]);
                    if (!(iAmFollowing_1_1 && !iAmFollowing_1_1.done && (_a = iAmFollowing_1.return))) return [3 /*break*/, 11];
                    return [4 /*yield*/, _a.call(iAmFollowing_1)];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14: return [4 /*yield*/, trackUnfollowings(idList)];
                case 15:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// TODO: notFollowing()
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, followingloop()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, followersLoop()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, comparison()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//main();
var scheduler = new toad_scheduler_1.ToadScheduler();
var task = new toad_scheduler_1.AsyncTask("simple task", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, main()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }, function (err) { return console.log(err); });
var job = new toad_scheduler_1.SimpleIntervalJob({ hours: 8, runImmediately: true }, task, "check my twitter");
scheduler.addSimpleIntervalJob(job);
console.log("Status: ", scheduler.getById("check my twitter").getStatus());
