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
};

export default UserRoutes;
