import { GeneralResponse } from "../interfaces/general-response.ineterface";
// All types will return general response

export type GraphQLRequests = {
    /**auth................ */  
    getCountryCodes: GeneralResponse,
    registerByPhone: GeneralResponse,
    verifyOtp: GeneralResponse,
    resendOtp: GeneralResponse,
    logout: GeneralResponse,

    /**Communtity */
    switchOrganizationList: GeneralResponse,
    switchOrganiztionPortal: GeneralResponse,
    communityActivePassiveMemberList: GeneralResponse,
    communityActivePassiveMemberDetails: GeneralResponse,
    communityMemberStatusChange: GeneralResponse,
    deleteCommunityMember: GeneralResponse,
    editCurrency: GeneralResponse,
    
    /** On board passive members */
    findUserByPhoneMail:GeneralResponse,
    resendOnboardingInvitation: GeneralResponse,   
    onboardPassiveMember: GeneralResponse,
    getState: GeneralResponse,
    onboardExistUser: GeneralResponse,

    //invitation
    passiveUserInvitationDetails: GeneralResponse;
    updatePassiveUserInvitationDetails: GeneralResponse;
    invitationResponse: GeneralResponse;
    
   //Community Management
   getMyCommunitiesView: GeneralResponse ;
   updateCommunityView: GeneralResponse;

   //Global Settings
   addOrgGlobalSettings: GeneralResponse;
   // getMyCommunitiesSettingsView: GeneralResponse;

   //Edit Webpage
   updateCommunityAnnouncementSettings: GeneralResponse; 
   getAllAnnouncementOrganization: GeneralResponse;
   getMyCommunitiesSettingsView: GeneralResponse;
   getMyCommunityEvents: GeneralResponse;
   getAllEventPayment: GeneralResponse;
   getEventPaymentById: GeneralResponse;
   addOrUpdatepayment: GeneralResponse;
   getCommunityPayments: GeneralResponse;
   getCommunityBasicDetails: GeneralResponse;
   communityMemberRoleFilter: GeneralResponse;
   updateCommunityAboutUsSettings: GeneralResponse;
   
   //Webpage Settings
   getCommunityHomePageOverviewByID: GeneralResponse;
   updateHomePageOverview: GeneralResponse;
   getCommunityVideos: GeneralResponse;
   getMyCommunityGroup: GeneralResponse;
   addOrUpdateVideo: GeneralResponse;
   getVideoDetails: GeneralResponse;

   /*Group*/
   groupStatusChange: GeneralResponse,
   deleteMyCommunityGroup: GeneralResponse,
   myCommunityCreateGroup: GeneralResponse;
   getMyCommunityGroupByID: GeneralResponse;
   updateMyCommunityGroup: GeneralResponse;
   removeOrgGroupMember: GeneralResponse;

   //Feedback
   getAllCommunityFeedbacks: GeneralResponse;
   viewedFeedbackStatus: GeneralResponse;
   communityReplyFeedback: GeneralResponse;
   
   //Event
   myCommunityEventStatusChange: GeneralResponse;
   myCommunitydeleteEvent: GeneralResponse,
   getMyCommunityEventByID: GeneralResponse;
   createMyCommunityEvent: GeneralResponse;
   myCommunityupdateEvent: GeneralResponse;
   createEvent: GeneralResponse;
   updateEvent: GeneralResponse; 
   getEventsCardDetails: GeneralResponse;
   getEventPaymentStatus: GeneralResponse;
   editRecurringEvent: GeneralResponse;
   getchildEventDetails: GeneralResponse;
   
   //Dashboard
   getmyCommunityDashboardList: GeneralResponse;

   //Global Search
   myCommunityDotNetGlobalSearch: GeneralResponse;
   
   //announcement
   createAnnouncementOrganization: GeneralResponse;
   deleteAnnouncementOrganizaztion: GeneralResponse;
   getAnnouncementOrganizationByID: GeneralResponse;
   updateMyCommunityAnnouncement: GeneralResponse;
   myCommunityAnnouncementStatusChange: GeneralResponse;

   //Notification
   getAllNotifications: GeneralResponse;

   //Reset Video
   resetVideo: GeneralResponse;

   //Sign up
   userDotNetSignUp: GeneralResponse;

   //Event task management
   getUserVisibility: GeneralResponse;
   createEventTask: GeneralResponse;
   getAllEventTask: GeneralResponse;
   eventTaskStatusChange: GeneralResponse;
   getTaskStatusCounting: GeneralResponse;
   deleteEventTask: GeneralResponse;
   getEventTaskById: GeneralResponse;
   updateEventTask: GeneralResponse;
   assignMembers: GeneralResponse;
   deleteAssignMember: GeneralResponse;
   acceptOrRejectUserList: GeneralResponse;
   removeGroupOrMemberEvent: GeneralResponse;
   getMyCommunityGroupList: GeneralResponse;
   getSupplierLogHistory: GeneralResponse;
   adminQuantityStatusChange: GeneralResponse;
   
   //Blog Management
   getAllBlogs: GeneralResponse;
   blogStatusChange: GeneralResponse;
   blogPaymentStatusChange: GeneralResponse;
   deleteBlogs: GeneralResponse;
   createBlogs: GeneralResponse;
   getBolgsById: GeneralResponse;
   updateblogs: GeneralResponse;
   getMyCommunityEventsForBlog: GeneralResponse;

   //Supplier Management
   getAllEventSupplierManagement: GeneralResponse;
   acceptOrRejectSupplierManagement: GeneralResponse;
   acceptOrRejectSupplierUserList: GeneralResponse;
   deleteEventSupplierManagement: GeneralResponse;
   assignSupplierMembers: GeneralResponse;
   deleteAssignSupplierMembers: GeneralResponse;
   updateEventSupplierManagement: GeneralResponse;
   createEventSupplierManagement: GeneralResponse;
   getEventSupplierById: GeneralResponse;
   getSupplierStatusCounting: GeneralResponse;
   updateEventSupplierManagementQuantity: GeneralResponse;
   
   //Memory Management
   getAllUploadImage: GeneralResponse;
   getUploadImageListCounting: GeneralResponse;
   uploadImage: GeneralResponse;
   approveOrRejectImage: GeneralResponse;
   imageStatusChange: GeneralResponse;

   //Emial Verification
   verifyCommunityEmail: GeneralResponse;
   verifyCommunityOTP: GeneralResponse;
   
   //payment management
   updateEventPayment: GeneralResponse;
   deleteEventPayment: GeneralResponse;
   getEventPaymentCardDetails: GeneralResponse;
   
   //Login user management
   getLoggedInUsers: GeneralResponse;

   //Promote or Demote
   promoteOrDemoteCommunityMember: GeneralResponse;

   //Edit User Profile
   updateUser: GeneralResponse;

   //cancel Event
   cancelEvent: GeneralResponse;

   //get role
   currentUserRole: GeneralResponse;

   //get community
   getCommunityByID: GeneralResponse;

   //Credits Remaining
   getCommunitiesSmsEmailCreditById: GeneralResponse;

   //set reminder
   updateSmsEmailGlobalSettings: GeneralResponse;
   viewSmsEmailGlobalSettings: GeneralResponse;
   setRemainderStatusChange: GeneralResponse;
   updateRsvpAdminControll: GeneralResponse;
   getAllRsvpAdminControll: GeneralResponse;
   removeRemainderSettingsEvent: GeneralResponse;
   eventImmediateRemember: GeneralResponse;
   getCornByEvent: GeneralResponse;
   deleteEventCron: GeneralResponse;

   //Request Member
   communityRequestList: GeneralResponse;
   approveOrRejectMemberRequest: GeneralResponse;

   //Mailing List
   getAllMailtemplates: GeneralResponse;
   createMailTemplates: GeneralResponse;
   getAllMailList: GeneralResponse;
   getMailListByID: GeneralResponse;
   getMailTemplateById: GeneralResponse;
   updateMailTemplates: GeneralResponse;
   deleteMailList: GeneralResponse;
   sendMailToMaillists: GeneralResponse;
   getMyCommunityEventsList: GeneralResponse;

   //Check in
   updateCheckIn: GeneralResponse;

   //Payment
   communityStripeDetails: GeneralResponse;

   //Role
   getRolePermissions: GeneralResponse;
   updateRolePermissions: GeneralResponse;
   addCommunityRole: GeneralResponse;
   getCommunityCreatedRoles: GeneralResponse;
   getUnAssignedMembers: GeneralResponse;
   assignUsherRole: GeneralResponse;
   getUsherAssignedMembers: GeneralResponse;

   //Add rsvp
   updateUserRsvp: GeneralResponse;
   getRsvpList: GeneralResponse;
   getRsvpMemberList: GeneralResponse;

   //Family member section
   getUserFamilyMembers: GeneralResponse;
   adminRemoveFamilyMember: GeneralResponse;
   getFamilyMemberDetails: GeneralResponse;
   adminUpdateFamilyMember: GeneralResponse;
   getUserByID: GeneralResponse;
   

   //Activity log
   getAllActivityLogs: GeneralResponse;

   //SMS verification
    smsAppVerifyByWeb: GeneralResponse;
    smsAppOtpVerifyByWeb: GeneralResponse;

    //Analytics
    getParticipationByEventTpe: GeneralResponse;
    getEventParticipationByUser: GeneralResponse;
    // getCommunityContribution: GeneralResponse;
    getCurrentCommunityContribution: GeneralResponse;
    mySpentAmmountVsTimeLine: GeneralResponse;
}