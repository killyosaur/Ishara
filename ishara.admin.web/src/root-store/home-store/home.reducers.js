import { HomeActionTypes } from "./home.actions";

export default (state = { articles: [] }, action = {}) => {
    switch (action.type) {
        case HomeActionTypes.HomePageLoadedAction:
            return {
                ...state,
                articles: action.data.articles
            };
        case HomeActionTypes.SubmitArticleAction:
            return {
                ...state,
                articles: ([action.data.article]).concat(state.articles)
            };
        case HomeActionTypes.DeleteArticleAction:
            return {
                ...state,
                articles: state.articles.filter(article => article._id !== action.data.id)
            };
        case HomeActionTypes.SetEditAction:
            return {
                ...state,
                articleToEdit: action.data.article,
            };
        case HomeActionTypes.EditArticleAction:
            return {
                ...state,
                articles: state.articles.map(article => {
                    if (article._id === action.data.article._id) {
                        return {
                            ...action.data.article
                        };
                    }

                    return article;
                }),
                articleToEdit: undefined
            };
        default:
            return state;
    }
};