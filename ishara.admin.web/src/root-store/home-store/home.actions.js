export const HomeActionTypes = {
    HomePageLoadedAction: 'HOME_PAGE_LOADED',
    SubmitArticleAction: 'SUBMIT_ARTICLE',
    DeleteArticleAction: 'DELETE_ARTICLE',
    SetEditAction: 'SET_EDIT',
    EditArticleAction: 'EDIT_ARTICLE'
};

export class HomePageLoaded {
    constructor(data) {
        Object.defineProperty(this, 'type', {
            get: () => { return HomeActionTypes.HomePageLoaded; }
        });
        this.data = data;
    }
};

export class SubmitArticle {
    constructor(data) {
        Object.defineProperty(this, 'type', {
            get: () => { return HomeActionTypes.SubmitArticleAction; }
        });
        this.data = data;
    }
};

export class DeleteArticle {
    constructor(data) {
        Object.defineProperty(this, 'type', {
            get: () => { return HomeActionTypes.DeleteArticleAction; }
        });
        this.data = data;
    }
};

export class SetEdit {
    constructor(data) {
        Object.defineProperty(this, 'type', {
            get: () => { return HomeActionTypes.SetEditAction; }
        });
        this.data = data;
    }
};

export class EditArticle {
    constructor(data) {
        Object.defineProperty(this, 'type', {
            get: () => { return HomeActionTypes.EditArticleAction; }
        });
        this.data = data;
    }
};

export const HomeActions =
    HomePageLoaded | SetEdit | DeleteArticle |
    EditArticle | SubmitArticle;