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

    // initializes main part from the website
    function initPage() {
        console.log('- initpage() called');
        model.getSelf((result) => {
            owner = result.displayName;
            console.log(`- user ${owner} logged in.`);

            model.getAllBlogs((blogs) => {
                if(blogs === undefined) 
                    return;
                
                // blogId = -1 => last showed blog
                // else blog with the id in blogId
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
    
        // shows info from current blog in the top tile besides the bloglist
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
    
    // Eventhandler for Navigation
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
    
    
    // sets values to only show basic login page
    function loginPage() {
        console.log("call from loginPage()");
        if(owner!== undefined) console.log(`user ${owner} logged out.`);
        init = false;
        blogId = -1;
        postId = -1;
        owner = undefined;
    }
    
    // remove possible content from div with "id" and appends "element" as child
    function replace(id, element){
        let main = document.getElementById(id);
        let content = main.firstElementChild;
        if(content) 
            content.remove();
        if(element) 
            main.append(element);
    }
    
    // sets innerHTML attribute in Element with id "id" to value in "text"
    function replaceText(id, text){
        let main = document.getElementById(id);
        if(main)
            main.innerHTML = text;
    }


    //Oeffentliche Methoden
    return {
        // Wird vom Router aufgerufen, wenn die Startseite betreten wird
        showStartPage() {
            console.log("--- call presenter.showStartPage()");
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
        showPostDetailView(bid, pid) {
            console.log(`--- call presenter.showDetailView(${bid} - ${pid}) ---`);
            detail = true;
            if (!init)
                initPage();
            model.getPost(bid, pid,  (post) => {
                post.setFormatDates(true);
                
                model.getAllCommentsOfPost(bid, pid, (comments) => {
                    comments.forEach(c => c.setFormatDates(true));
                    let page = detailView.render(post, comments);
                    page.addEventListener("click", handleActions);
                    replace('main-content', page);
                    console.log("--- replace main-content with detail-view ---");
                });
            });
        },
        
        // Wird vom Router aufgerufen, wenn eine Editier-Ansicht angezeigt werden soll
        showEditPostView(bid, pid){
            console.log(`Aufruf von presenter.showEditPostView(${bid},${pid})`);
            if(!init) 
                initPage();
            blogId = bid;
            model.getPost(blogId, pid, (post) => {
                post.setFormatDates(true);
                let view = editPostView.render(post);
                replace("main-content", view);
            });
        },
        
        // Wird vom Router aufgerufen, wenn eine Post-Hinzufügen-Ansicht angezeigt werden soll
        showAddPostView(bid){
            console.log(`Aufruf von presenter.showAddPostView(${bid})`);
            if(!init) 
                initPage();
            blogId = bid;
            let view = addPostView.render(blogId);
            replace("main-content", view);
        },
        
        // Wird vom action Eventhandler aufgerufen. wenn ein Post gelöscht werden soll
        deletePost(pid, source){
            console.log(`Aufruf von presenter.deletePost(${pid}, ${source})`);
            if(!confirm("Wollen sie den Post wirklich loeschen?"))
                return;
            model.deletePost(blogId, pid, () => {
                updateCurrentBlogTile(blogId);
                if(!detail){
                    let post = source.closest("section");
                    post.remove();
                }else{
                    router.navigateToPage("/blogOverview/" + blogId);
                }
            });
        },
        
        // Wird vom action Eventhandler aufgerufen, wenn ein Kommentar gelöscht werden soll
        deleteComment(cid, source){
            console.log(`Aufruf von presenter.deleteComment(${cid}, ${source})`);
            if(!confirm("Wollen sie den Kommentar wirklich loeschen?"))
                return;
            model.deleteComment(blogId, postId, cid, () => {
                let art = source.closest("ARTICLE");
                let head = art.parentElement.querySelector(".comments-header");
                art.remove();
                console.log(head.innerHTML);
                let nrComments = +head.innerHTML.split(" ")[0];
                head.innerHTML = `${nrComments - 1} Kommentar(e)`;
                console.log("Comment has been deleted");
            });
        },
        
        updateCurrentBlog(){
            updateCurrentBlogTile(blogId);
        }
        
        
    };
    
})();
