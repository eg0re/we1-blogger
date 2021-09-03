"use strict";

const util = {
    // Nimmt alle Attribute von object und ersetzt gleichnamige, mit %<name>%
    // gekennzeichnete Wörter im innerHTML von element mit dem Attributwert
    setDataInfo(element, object) {
        let cont = element.innerHTML;
        for (let key in object) {
            let rexp = new RegExp("%" + key + "%", "g");
            cont = cont.replace(rexp, object[key]);
        }
        element.innerHTML = cont;
    },
    
    childCloneNode(id, removeId) {
        let elem = document.getElementById(id).cloneNode(true);
        if(removeId)
            elem.removeAttribute("id");
        return elem;
    }
};

const initPageView = {
    // Erstellt eine View für die Startseite
    render(blogs) {
        console.log("creating view for main page");
        if(!blogs) 
            return;

        let cont = util.childCloneNode("templ-head-nav", true);
        let liTempl = cont.firstElementChild;
        liTempl.remove();

        for(let b of blogs){
            let blogInfo = liTempl.cloneNode(true);
            let wrapper = document.createElement("DIV");
            wrapper.appendChild(blogInfo);
            console.log("filling data info");
            util.setDataInfo(wrapper, b);
            cont.appendChild(wrapper.firstElementChild);
        }
        return cont;
    }
};

const blogView = {
    render(id, posts) {
        console.log("- creating view for Blog(" + id + ")");
        let cont = document.createElement("div");
        let articleTempl = util.childCloneNode("templ-blog-overview", true);
        let header = articleTempl.children[0];
        util.setDataInfo(header, posts[0]);
        cont.append(header);
        for (const post of posts) {
            let articlePostTempl = util.childCloneNode("blog-overview-post", true);
            util.setDataInfo(articlePostTempl, post);
            cont.append(articlePostTempl);
            console.log("-- adding post to view (" + post.p_id + ")");
        }
        return cont;
    }
};

const currentBlogTileView = {
    // Erstellt eine View, die Informationen zum ausgewählten Blog anzeigt
    render(blog) {
        let cont = util.childCloneNode("templ-current-blog", false);
        cont.setAttribute("id", "visible-current-blog");
        util.setDataInfo(cont, blog);
        return cont;
    }
};


const detailView = {
    render(post, comments) {
        console.log("- creating detailview for Blog(" + post.b_id + ")");
        let cont = util.childCloneNode("templ-detail-view", true);
        let commentSection = cont.lastElementChild;
        let commentTempl = commentSection.lastElementChild;
        commentTempl.remove();
        
        if(comments.length !== 0) {
            for (let c of comments) {
                let temp = commentTempl.cloneNode(true);
                util.setDataInfo(temp, c);
                commentSection.appendChild(temp);
                console.log("-- appending comment to view (" + c.c_id + ")");
            }
        }
        
        util.setDataInfo(cont, post);
        return cont;
    }
};

const addPostView = {
    // Erstellt eine View für das Hinzufügen von Posts
    render(blogId) {
        let buttonHandler = function (event){
            switch(event.target.type){
                case "submit":
                    event.preventDefault();
                    if(!confirm("Wollen sie den Post wirklich veröffentlichen?")) 
                        return;
                    let f = document.forms.postInput;
                    model.addNewPost(blogId, f.elements.title.value, f.elements.self.value, (post) => {
                        if(!post) 
                            return;
                        presenter.updateCurrentBlog();
                        router.navigateToPage("/detailView/" + post.blog.id + "/" + post.id);
                    });
                    break;
                case "reset":
                    router.navigateToPage("/blogOverview/" + blogId);
                    break;
            }
        };
        let cont = util.childCloneNode("templ-add-post", true);
        let f = cont.firstElementChild;
        f.setAttribute("name", "postInput");
        let navTag = cont.querySelector("nav");
        navTag.addEventListener("click", buttonHandler);
        return cont;
    }
};

const editPostView = {
    // Erstellt eine View für das Editieren von Posts
    render(post) {
        let buttonHandler = function(event){
            let routingTarget = "/detailView/" + post.b_id + "/" + post.p_id;
            switch(event.target.type){
                case "submit":
                    event.preventDefault();
                    if(!confirm("Wollen sie den Post wirklich editieren?")) 
                        return;

                    let wrapperDiv = event.target.closest(".edit-post");
                    let divs = wrapperDiv.querySelectorAll("div");
                    let titleDiv = divs[0];
                    let contentDiv = divs[1];
                    model.updatePost(post.b_id, titleDiv.dataset.id, titleDiv.innerHTML, contentDiv.innerHTML, (post) => {
                        if(post) 
                            router.navigateToPage(routingTarget);
                    });
                    break;
                case "reset":
                    router.navigateToPage(routingTarget);
                    break;
            }
        };
        
        let cont = util.childCloneNode("templ-edit-post", true);
        util.setDataInfo(cont, post);
        let navTag = cont.querySelector("NAV");
        navTag.addEventListener("click", buttonHandler);
        return cont;
    }
};

