/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

class UserRoutes {
    static rootPath = '/users';
    static registrationPath = `${UserRoutes.rootPath}/register`;
    // static loginPath = `${UserRoutes.rootPath}/login`;
    // static pswdResetPath = `${UserRoutes.rootPath}/password/reset`;
    // static emailConfirmPath = `${UserRoutes.rootPath}/email/resend-confirmation`;
    static userInformation = `${UserRoutes.rootPath}/:username`;
    static userSearch = `/search${UserRoutes.rootPath}`;
    static userUpdate = `${UserRoutes.rootPath}/:username`;
    static swipe = `${UserRoutes.rootPath}/swipe/:event_id`;
    static userManager = `${UserRoutes.rootPath}/manager/:user_id/:list_type`;
    static userOAuthGrant = `${UserRoutes.rootPath}/:user_id/oauth/grant`;
    static userOAuthRevoke = `${UserRoutes.rootPath}/:user_id/oauth/revoke`;
    static userRelationship = `${UserRoutes.rootPath}/network/relationships/`;
    static userUpload = `${UserRoutes.rootPath}/media/:userid`;
};

export default UserRoutes;
