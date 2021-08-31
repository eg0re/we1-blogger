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
        console.log('initpage() called');
        model.getSelf((result) => {
            owner = result.displayName;
            console.log(`user ${owner} logged in.`);

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
                        blogId = mostRecent.b_id;
                    }
                }
                
                replaceText("username_header", owner);
                let headerNav = initPageView.render(blogs);
                replace("nav_header", headerNav);
                
                updateCurrentBlogTile(blogId);

                init = true;
                let main = document.body;
                main.addEventListener("click", handleClicks);
                if (window.location.pathname === "/")
                    router.navigateToPage('/blogOverview/' + blogId);
            });
        });
    }
    
        // Aktualisiert die Kurzzusammenfassung des Blogs, der derzeitig angezeigt wird
    function updateCurrentBlogTile(id) {
        if(id === undefined || id === -1) 
            return;
        
        model.getBlog(id, (blog) => {
            blog.setFormatDates(false);
            let oldTile = document.getElementById("visible-current-blog");
            if(oldTile) oldTile.remove();
            
            let newTile = currentBlogTileView.render(blog);
            let head = document.getElementById("head");
            head.appendChild(newTile);
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
    
    function handleActions(event) {
        let source = event.target.closest("LI");
        if(source){
            let action = source.dataset.action;
            if(action)
                presenter[action](source.dataset.id, source);
        }
    }
    
    
    // Sorgt dafür, dass bei einem nicht-angemeldeten Nutzer nur noch der Name der Anwendung
    // und der Login-Button angezeigt wird.
    function loginPage() {
        console.log("call from loginPage()");
        if(owner!== undefined) console.log(`user ${owner} logged out.`);
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
            console.log("call presenter.showStartPage()");
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
        showOverview(bid) {
           console.log(`--- call presenter.showOverview(${bid}) ---`);
           detail = false;
           if (!init) initPage();
           model.getAllPostsOfBlog(bid, (posts) => {
               posts.forEach(
                   p => p.setFormatDates(true)
               );
               let page = blogView.render(bid, posts);
               replace('main-content', page);
               console.log("--- replace main-content with blog-overview ---");
           }); 
        },
        
        // Wird gecalled, wenn eine Post Detailansicht angezeigt werden soll
        showPostDetailView(blogId, postId) {
            console.log(`--- call presenter.showDetailView(${blogId} - ${postId}) ---`);
            detail = true;
            if (!init)
                initPage();
            model.getPost(blogId, postId,  (post) => {
                post.setFormatDates(true);
                
                model.getAllCommentsOfPost(blogId, postId, (comments) => {
                    comments.forEach(c => c.setFormatDates(true));
                    let page = detailView.render(post, comments);
                    page.addEventListener("click", handleActions);
                    replace('main-content', page); 
                });
            });
        }
    };
    
})();
