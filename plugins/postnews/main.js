var templates = [
    "root/externallib/text!root/plugins/postnews/postnews.html"
];

define(templates, createPlugin);

function createPlugin(postnewsTpl){
    
    var plugin = {
        settings: {
            name: "postnews",
            type: "course",
            menuURL: "#postnews/",
            lang:{
                component:"core"
            }
        },
        
        routes: [
            ["postnews/:courseId", "showForm", "postNews"],
            ["postnews/post/:courseId", "post", "post"]
        ],
        
        isPluginVisible : function(){
            
            return MM.util.wsAvailable('local_mobile_get_user_roleid') 
                && MM.util.wsAvailable('local_mobile_add_newpost_to_forumnews');
            
        },
        
        isPluginForTeacher: function (courseId) {
            
            var params = {
                'userId': MM.config.current_site.userid,
                'courseId': courseId
            };

            MM.moodleWSCall('local_mobile_get_user_roleid', params,
                function (user) {
                    if (user['roleid'] == 3 || user['roleid'] == 4)
                    {
                        $('div[id="loading-postnews/' + courseId + '"]').remove();
                    }
                    else
                    {
                        $('div[id="loading-postnews/' + courseId + '"]').parent().remove();
                    }
                }, null,
                function (m) {
                    $('div[id="loading-postnews/' + courseId + '"]').parent().remove();
                    errorCallBack(m);
                }
            );
    
        },
        
        postNews : function(courseId){
            
            var tpl = {courseId : courseId};
            var html = MM.tpl.render(MM.plugins.postnews.templates.postnews.html, tpl);
            var pageTitle = MM.lang.s("postnews");
            MM.panels.show('center', html, {title: pageTitle, hideRight: true});
            
        },
        
        cancel : function(){
            
            $("#subject, #message").val("");
            MM.panels.menuShow();
            
        },
        
        post : function(courseId){

            var subject = $.trim($("#subject").val());
            var message = $.trim($("#message").val());
            
            if (!subject || !message){
                MM.popErrorMessage(MM.lang.s("somefieldrequired"));
                MM.Router.navigate("postnews/" + courseId);
                return;
            }
            
            $("#subject, #message").prop('disabled', true);
            $('a[href="#postnews/post/' + courseId + '"]').children(0).addClass("loading-row-black");

            var params = {
                'userId': MM.config.current_site.userid,
                'courseId': courseId,
                'subject': subject,
                'message': message
            };

            MM.moodleWSCall('local_mobile_add_newpost_to_forumnews', params,
                function (data) {
                    $('a[href="#postnews/post/' + courseId + '"]').children(0).removeClass("loading-row-black");
                    $("#subject, #message").prop('disabled', false);
                    if (data['id'] == -1)
                    {
                        MM.popErrorMessage(MM.lang.s("forumnewsnotavailable"));
                        MM.Router.navigate("postnews/" + courseId);
                    }
                    else if(data['id'] == -2){
                        MM.popErrorMessage(MM.lang.s("notpermission"));
                        MM.Router.navigate("postnews/" + courseId);
                    } else {
                        MM.popMessage(MM.lang.s("success"), {title: MM.lang.s("ok"), autoclose: 3000});
                        $("#subject, #message").val("");
                        MM.plugins.forum.showDiscussion(courseId, data['id']);
                    }
                },
                {
                    getFromCache: false,
                    saveToCache: false
                },
                function (e) {
                    $('a[href="#postnews/post/' + courseId + '"]').children(0).removeClass("loading-row-black");
                    $("#subject, #message").prop('disabled', false);
                    errorCallBack(e);
            });
                
        },
        
        templates: {
            "postnews": {
                html: postnewsTpl
            }
        }
    };
    
    MM.registerPlugin(plugin);
    
};