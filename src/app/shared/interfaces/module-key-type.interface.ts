import { TypedDocumentNode, ResultOf, VariablesOf } from "apollo-angular";
export interface ModuleKeyType {
    //auth
    'getCountryCodes': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'registerByPhone': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'verifyOtp': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'resendOtp': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'logout':TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    
    //communitity
    'switchOrganizationList': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'switchOrganiztionPortal': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'communityActivePassiveMemberList': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'communityActivePassiveMemberDetails': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'communityMemberStatusChange': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'deleteCommunityMember': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'editCurrency': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    
    //onBoard passive member
    'findUserByPhoneMail': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'resendOnboardingInvitation': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'onboardPassiveMember': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getState': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'onboardExistUser': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //invitation 
    'passiveUserInvitationDetails': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'updatePassiveUserInvitationDetails': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'invitationResponse': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getMyCommunitiesView': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'updateCommunityView': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //global settings
    'addOrgGlobalSettings': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getMyCommunitiesSettingsView': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //edit webpage
    'updateCommunityAnnouncementSettings': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getAllAnnouncementOrganization': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getMyCommunityEvents': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getAllEventPayment': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getEventPaymentById': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'addOrUpdatepayment': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getCommunityPayments': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getCommunityBasicDetails': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'communityMemberRoleFilter': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'updateCommunityAboutUsSettings': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    
    //Webpage Settings
    'getCommunityHomePageOverviewByID': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'updateHomePageOverview': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getCommunityVideos': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getMyCommunityGroup': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'addOrUpdateVideo': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getVideoDetails': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Group
    'groupStatusChange': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'deleteMyCommunityGroup': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'myCommunityCreateGroup': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getMyCommunityGroupByID': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'updateMyCommunityGroup': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Feedback
    'getAllCommunityFeedbacks': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'viewedFeedbackStatus': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'communityReplyFeedback': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Event
    'myCommunityEventStatusChange': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'myCommunitydeleteEvent': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getMyCommunityEventByID': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'createMyCommunityEvent': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'myCommunityupdateEvent': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'createEvent': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'updateEvent': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getEventsCardDetails': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getEventPaymentStatus': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'editRecurringEvent': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getchildEventDetails': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    //Dashboard
    'getmyCommunityDashboardList': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Global Search
    'myCommunityDotNetGlobalSearch': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    
    //Announcement
    'createAnnouncementOrganization': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'deleteAnnouncementOrganizaztion': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getAnnouncementOrganizationByID': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'updateMyCommunityAnnouncement': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'myCommunityAnnouncementStatusChange': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Notificaation
    'getAllNotifications': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Reset Video
    'resetVideo': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Sign up
    'userDotNetSignUp': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Event task management
    'getUserVisibility': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'createEventTask': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getAllEventTask': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'eventTaskStatusChange': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getTaskStatusCounting': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'deleteEventTask': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getEventTaskById': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'updateEventTask': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'assignMembers': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'deleteAssignMember': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'acceptOrRejectUserList': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'removeGroupOrMemberEvent': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getMyCommunityGroupList': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getSupplierLogHistory': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'adminQuantityStatusChange': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    
    //Blog management
    'getAllBlogs': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'blogStatusChange': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'blogPaymentStatusChange': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'deleteBlogs': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'createBlogs': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getBolgsById': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'updateblogs': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getMyCommunityEventsForBlog': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'removeOrgGroupMember': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Supplier management
    'getAllEventSupplierManagement': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'acceptOrRejectSupplierManagement': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'acceptOrRejectSupplierUserList': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'deleteEventSupplierManagement': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'assignSupplierMembers': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'deleteAssignSupplierMembers': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'updateEventSupplierManagement': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'createEventSupplierManagement': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getEventSupplierById': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getSupplierStatusCounting': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'updateEventSupplierManagementQuantity': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Memory Management
    'getAllUploadImage': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getUploadImageListCounting': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'uploadImage': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'approveOrRejectImage': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'imageStatusChange': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Email Verification
    'verifyCommunityEmail': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'verifyCommunityOTP': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    
    //payment module
    'updateEventPayment': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'deleteEventPayment': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getEventPaymentCardDetails': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    
    //Login user management
    'getLoggedInUsers': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //promote or Demote
    'promoteOrDemoteCommunityMember': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Edit User Profile
    'updateUser': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //cancel event
    'cancelEvent': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //get role
    'currentUserRole': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //get community
    'getCommunityByID': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Credits Remaining
    'getCommunitiesSmsEmailCreditById': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //set reminder
     'updateSmsEmailGlobalSettings': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
     'viewSmsEmailGlobalSettings': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
     'setRemainderStatusChange': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
     'updateRsvpAdminControll': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
     'getAllRsvpAdminControll': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
     'removeRemainderSettingsEvent': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
     'eventImmediateRemember': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
     'getCornByEvent': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
     'deleteEventCron': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Request Member
    'communityRequestList': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'approveOrRejectMemberRequest': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Mailing List
    'getAllMailtemplates': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'createMailTemplates': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getAllMailList': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getMailListByID': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getMailTemplateById': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'updateMailTemplates': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'deleteMailList': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'sendMailToMaillists': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getMyCommunityEventsList': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Check In
    'updateCheckIn': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Payment
    'communityStripeDetails': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Role
    'getRolePermissions': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'updateRolePermissions': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'addCommunityRole': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getCommunityCreatedRoles': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getUnAssignedMembers': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'assignUsherRole': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getUsherAssignedMembers': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Add rsvp
    'updateUserRsvp': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getRsvpList': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getRsvpMemberList': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Family member section
    'getUserFamilyMembers': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'adminRemoveFamilyMember': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getFamilyMemberDetails': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'adminUpdateFamilyMember': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getUserByID': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //Activity log
    'getAllActivityLogs': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;

    //SMS verification
    'smsAppVerifyByWeb': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'smsAppOtpVerifyByWeb': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;


    //Analytics
    'getParticipationByEventTpe': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getEventParticipationByUser': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    // 'getCommunityContribution': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'getCurrentCommunityContribution': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
    'mySpentAmmountVsTimeLine': TypedDocumentNode<ResultOf<any>, VariablesOf<any>>;
}