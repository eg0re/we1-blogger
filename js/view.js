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
        cont.append(articleTempl.children[0]);
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
    render(post) {
        console.log("- creating detailview for Blog(" + post.b_id + ")");
        let cont = util.childCloneNode("templ-detail-view", true);
        util.setDataInfo(cont, post);
        return cont;
    }
};

