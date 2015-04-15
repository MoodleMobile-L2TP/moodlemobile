var templates = [
    "root/externallib/text!root/plugins/notifications/notifications.html"
];

define(templates, createPlugin);

function createPlugin(notificationsTpl) {

    var plugin = {
        
        settings: {
            name: "notifications",
            type: "general",
            icon: "plugins/notifications/icon.png",
            menuURL: "#notifications",
            lang: {
                component: "core"
            }
        },
        
        routes: [
            ["notifications", "notifications", "showNotifications"],
            ["notifications/viewall", "notifications", "viewAllNotifications"]
        ],
        
        isPluginVisible : function(){
            
            return MM.util.wsAvailable('local_mobile_get_notifications');
            
        },
        
        data : new Array({timemodified: 0}),
        limit : 5,
        showAll : true,
        
        showNotifications: function () {
            
            $("#count-notifications").html("");
            $("#count-notifications").removeClass("count-notifications");
            var tpl = {
                data: MM.plugins.notifications.data,
                showAll : MM.plugins.notifications.showAll
            };
            var html = MM.tpl.render(MM.plugins.notifications.templates.notifications.html, tpl);
            var pageTitle = MM.lang.s('notifications');
            MM.panels.show('center', html, {title: pageTitle, hideRight: true});
            
        },
        
        hrefindex : [location.href, location.href + "#"],
        
        getNotifications: function () {
            
            if ($.inArray(location.href, MM.plugins.notifications.hrefindex) > -1) {
                var params = {
                    'userid': MM.config.current_site.userid,
                    'limit': MM.plugins.notifications.limit
                };
                MM.moodleWSCall('local_mobile_get_notifications', params, 
                function (data) {
                    $("#loading-notifications").remove();
                    
                    if (data.length > 0 && data[0].timemodified != MM.plugins.notifications.data[0].timemodified) {
                        MM.plugins.notifications.showAll = true;
                        MM.plugins.notifications.data = data;
                        MM.plugins.notifications.successGetNotifications(data);
                    }
                },
                {saveToCache: true, getFromCache: false},
                function (e) {
                    $("#loading-notifications").remove();
                    errorCallBack(e);
                });
            }
            
        },
        
        successGetNotifications: function (data) {
            var arrNone = data.filter(function (item) {
                return item.status == "none";
            });
            var count = arrNone.length;
            if (count > 0)
            {
                if(count > 9){
                    count = "9+";
                }
                $("#count-notifications").html(count);
                $("#count-notifications").addClass("count-notifications");
            }
            
        },
        
        viewAllNotifications : function(){
            
            var panel = $("#panel-notifications");
            panel.html("");
            $("html, body").animate({
                scrollTop: $("#panel-notifications").position().top
            });
            var loading = "<div id='loading-allnotifications' class='centered'>";
            loading += "<img src='img/loadingblack.gif' alt='loading...' /></div>";
            panel.html(loading);
            
            var params = {
                    'userid': MM.config.current_site.userid,
                    'limit': 0
                };
                MM.moodleWSCall('local_mobile_get_notifications', params, 
                function (data) {
                    $("#loading-allnotifications").remove();
                    if (data.length > 0) {
                        MM.plugins.notifications.data = data;
                        MM.plugins.notifications.showAll = false;
                        MM.plugins.notifications.showNotifications();
                    }
                },
                {saveToCache: true, getFromCache: false},
                function (e) {
                    $("#loading-allnotifications").remove();
                    errorCallBack(e);
                });
            
        },
        
        templates: {
            
            "notifications": {
                html: notificationsTpl
            }
            
        }
    };

    MM.registerPlugin(plugin);
    
}