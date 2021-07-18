/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global initPageView */

"use strict";

const presenter = (function () {
    // Private Variablen und Funktionen
    let init = false;
    let blogId = -1;
    let postId = -1;
    let owner = undefined;
    let detail = false;

    // Initialisiert die allgemeinen Teile der Seite
    function initPage() {
        console.log('initpage() ausgeführt');
        model.getSelf((result) => {
            owner = result.displayName;
            console.log(`Presenter: Nutzer*in ${owner} hat sich angemeldet.`);

            model.getAllBlogs((blogs) => {
                if(blogs === undefined) 
                    return;
                
                // Wenn blogId -1 ist, wird der Blog, welcher zuletzt geändert
                // wurde, angezeigt. Sonst wird der Blog mit der id in blogId angezeigt.
                if(blogId === -1){
                    let mostRecent;
                    for(let blog_i of blogs){
                        if(mostRecent === undefined ||
                                blog_i.b_lastedit > mostRecent.b_lastedit){
                            mostRecent = blog_i;
                        }
                    }
                    if(mostRecent){
                        blogId = mostRecent.blogId;
                    }
                }
                
                replaceText("username_header", owner);
                let headerNav = initPageView.render(blogs);
                replace("nav_header", headerNav);

                init = true;
                let main = document.body;
                main.addEventListener("click", handleClicks);
                if (window.location.pathname === "/")
                    router.navigateToPage('/blogOverview/' + blogId);
            });
        });
    }
    
    // Eventhandler für Navigation
    function handleClicks(event) {
        let source = null;
        switch(event.target.tagName){
            case "A":
                router.handleNavigationEvent(event);
                break;
            case "BUTTON":
                source = event.target;
                break;
            default:
                source = event.target.closest("LI");
                break;
        }
        if(source){
            let path = source.dataset.path;
            if(path)
                router.navigateToPage(path);
        }
    }
    
    // Sorgt dafür, dass bei einem nicht-angemeldeten Nutzer nur noch der Name der Anwendung
    // und der Login-Button angezeigt wird.
    function loginPage() {
        console.log("Presenter: Aufruf von loginPage()");
        if(owner!== undefined) console.log(`Presenter: Nutzer*in ${owner} hat sich abgemeldet.`);
        init = false;
        blogId = -1;
        postId = -1;
        owner = undefined;
    }
    
    // Entfernt möglichen Inhalt aus dem Element mit der id "id" und fügt das 
    // Element "element" als Kind hinzu.  
    function replace(id, element){
        let main = document.getElementById(id);
        let content = main.firstElementChild;
        if(content) 
            content.remove();
        if(element) 
            main.append(element);
    }
    
    // Setzt das innerHTML Attribut im Element mit der id "id" zum Wert in "text"
    function replaceText(id, text){
        let main = document.getElementById(id);
        if(main)
            main.innerHTML = text;
    }


    //Oeffentliche Methoden
    return {
        // Wird vom Router aufgerufen, wenn die Startseite betreten wird
        showStartPage() {
            console.log("Aufruf von presenter.showStartPage()");
            // Wenn vorher noch nichts angezeigt wurde, d.h. beim Einloggen
            if (model.isLoggedIn()) { // Wenn der Nutzer eingeloggt ist
                initPage();
            }
            if (!model.isLoggedIn()) { // Wenn der Nuzter eingelogged war und sich abgemeldet hat
                //Hier wird die Seite ohne Inhalt angezeigt
                loginPage();
            }
        },

        // Wird vom Router aufgerufen, wenn eine Blog-Übersicht angezeigt werden soll
        showOverview() {
           console.log(`Aufruf von presenter.showOverview(${blogId})`);
           detail = false;
           if (!init)
               initPage();
           model.getAllBlogs((result) => {
               let page = blogView.render(result);
               replace('main-content', page);
           }); 
        },
        
        showDetailView(id) {
            detail = true;
            if (!init)
                initPage();
            model.getAllPostsOfBlog(id, (result) => {
                let page = detailView.render(result);
                replace('main-content', page);
            });
        }
    };
    
})();
