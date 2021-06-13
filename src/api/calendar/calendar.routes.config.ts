/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

class CalendarRoutes {
    static rootPath = '/calendar';
    static addEventPath = `${CalendarRoutes.rootPath}/create/:userid`;
    static freeBusyPath = `${CalendarRoutes.rootPath}/freebusy/:userid`;
    static freeBusyIterativePath = `${CalendarRoutes.rootPath}/freebusyiterative/:userids`;
    static eventsListPath = `${CalendarRoutes.rootPath}/listevents/:userid`;
};

export default CalendarRoutes;
