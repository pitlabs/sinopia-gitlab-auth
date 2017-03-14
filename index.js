const request = require('request');
const crypto = require('crypto');

module.exports = function(config){
    const gitlabUrl = config.url + (config.url.substr(-1) == '/' ? '' : '/');

    const userApi = 'api/v4/user?private_token=';
    const groupsApi = 'api/v4/groups?private_token=';

    const cache = {};
    const cacheTime = 60 * 1000;

    function getProjectCollectionsFromGitlab(user, pat){
        return new Promise(function(resolve, reject){
            request.get(gitlabUrl + userApi + pat, function(error, response){
                if (error || response.statusCode != 200) {
                    resolve(false);
                }else{
                    var body = JSON.parse(response.body);
                    if(user == body.username){
                        request.get(gitlabUrl + groupsApi + pat, function (error, response) {
                                if (error || response.statusCode != 200) {
                                    resolve(false);
                                } else {
                                    var body = JSON.parse(response.body);
                                    var groups = [user]
                                    for(var g of body){
                                        groups.push(g.path);
                                    }
                                    resolve(groups);
                                }
                        });
                    }else{
                        resolve(false);
                    }
                }
            });
        });
    }

    function getCachedGroups(user, password, getFromApi){
        const hash = crypto.createHash('sha256');
        var hashedPW = hash.digest(password, 'hex');
        var c = cache[user];
        if(c && Date.now() - c.created < cacheTime && c.password == hashedPW){
            c.groups;
        }else{
            return getFromApi(user, password).then(function(groups){
                cache[user] = {
                    groups: groups,
                    password: hashedPW,
                    created: Date.now()
                }
                return groups;
            });
        }
    }

    return{
        authenticate: function(user, password, cb){
            getCachedGroups(user, password, getProjectCollectionsFromGitlab).catch(function(){
                return false;
            }).then(function(groups){
                cb(null, groups);
            });
        },

        addUser: function(user, password, cb){
            // adding users is not supported.
            cb(null, false);
        }
    };
};

