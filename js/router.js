/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

const router = (function () {
    // Private Variable
    let mapRouteToHandler = new Map();

    // Oeffentliche Methoden
    return {
        // Fügt eine neue Route (URL, auszuführende Funktion) zu der Map hinzu
        addRoute: function (route, handler) {
            mapRouteToHandler.set(route, handler);
        },

        // Wird aufgerufen, wenn zu einer anderen Adresse navigiert werden soll
        navigateToPage(url) {
            history.pushState(null, "", url);
            this.handleRouting();
        },

        // Wird als Eventhandler an ein <a>-Element gebunden
        handleNavigationEvent: function (event) {
            if(!(event.target.rel && event.target.rel === "external")) {
                event.preventDefault();
                let url = event.target.href;
                this.navigateToPage(url);
            }
        },

        // Wird als EventHandler aufgerufen, sobald die Pfeiltasten des Browsers betätigt werden
        handleRouting: function () {
            console.log("call router.handleRouting(): navigates to: " + window.location.pathname);
            const currentPage = window.location.pathname.split('/')[1];
            let routeHandler = mapRouteToHandler.get(currentPage);
            if (routeHandler === undefined)
                routeHandler = mapRouteToHandler.get(''); //Startseite
            routeHandler(window.location.pathname);
        }
    };
})();

// Selbsaufrufende Funktionsdeklaration: (function name(){..})();
(function initRouter() {
    console.log('initRouter() calling itself')
    // The "Startpage".
    router.addRoute('', function () {
        presenter.showStartPage();
    });
    
    // Übersicht eines Blogs mit allen Posts
    router.addRoute('blogOverview', function (url) {
        // Get the index of which blog we want to show and call the appropriate function.
        let blogId = url.split('blogOverview/')[1].trim();
        presenter.showOverview(blogId);
    });
    
    // Detailansicht eines Posts
    router.addRoute('detailView', function (url){
       let idPath = url.split('detailView/')[1].trim();
       let ids = idPath.split('/');
       let blogId = ids[0];
       let postId = ids[1];
       presenter.showPostDetailView(blogId, postId);
    });
    
    // Wenn nach edit/blogId eine postId vorhanden ist Bearbeiten-Ansicht, wenn 
    // nicht, dann Post-hinzufügen-Ansicht
    router.addRoute('edit', function(url){
       let idPath = url.split('/edit/')[1];
       let ids = idPath.split('/');
       let blogId = ids[0];
       let postId = ids[1];
       if(postId){
           postId = postId.trim();
           presenter.showEditPostView(blogId, postId);
       }else{
           presenter.showAddPostView(blogId);
       }
    });
    
    if (window) {
        window.addEventListener('popstate', (event) => {
            router.handleRouting();
        });
    }
})();


