import { AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, AfterContentInit } from '@angular/core';
import { CommunityModalComponent } from 'src/app/shared/components/community-modal/community-modal.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ActivatedRoute, Router } from "@angular/router";
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { CommunityService } from 'src/app/shared/services/community.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { communities } from 'src/app/shared/typedefs/custom.types';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CommonService } from '../../services/common.service';
import { paramService } from 'src/app/shared/params/params';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

declare var window: any;

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnChanges, OnDestroy, AfterContentInit {
  @ViewChild("sidebar") sidebar!: ElementRef<HTMLDivElement>;
  @ViewChild("sidebarToggleBtn") sidebarToggleBtn!: ElementRef<HTMLButtonElement>;

  menuList!: any;
  currentRoute!: string;
  $modal: any;
  communities!: Array<communities>;
  communityId!: any;
  length!: number;
  comId!: any;
  data: any;
  image: any;
  searchForm!: FormGroup;
  searchData: any;
  announcements: any;
  events: any;
  groups: any;
  videos: any;
  communityfeedbacks: any;
  search: any;
  sub: any;
  notificationDetails: any;
  ShowComingNotificaton: boolean = false;
  notificationLength: number = 0;
  hasNewNotifications: boolean = false;
  comName!: string;
  roleData!: any;
  getRoles!: any;
  isSidebar: boolean = false;

  // 🔥 ADDED: Property to track the currently expanded menu item
  expandedMenuId: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private communityService: CommunityService,
    private StorageService: StorageService,
    private alertService: AlertService,
    private commonService: CommonService,
    private paramService: paramService,
    private notificationService: NotificationService,
    private _location: Location
  ) { }

  ngOnDestroy(): void {
    if (this.sub && !this.sub.closed) {
      this.sub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.generateSearchForm();
    this.currentRoute = this.router.url;
    this.paramService.updatecurrentRoute(this.currentRoute);

    // Subscribe to route changes
    this.paramService.currentRoute.subscribe(data => {
      this.currentRoute = data;
      this.commonService.sendUrl(1);
      this.checkCurrentRouteForExpansion(); // 🔥 ADDED: Check expansion on route change
    });

    // Initialize roles and permissions
    this.initializeRolesAndPermissions();

    // Initialize menu list
    this.buildMenuList();
    this.checkCurrentRouteForExpansion(); // 🔥 ADDED: Check expansion on init

    // Load communities
    this.communitityList();

    // Subscribe to image changes
    this.commonService.getImage().subscribe((data) => {
      this.image = data ? data : this.StorageService.getLocalStorageItem('communitylogo');
    });

    // Subscribe to search changes
    this.commonService.getSearch().subscribe((val) => {
      if (val === "no search") {
        this.searchForm.controls['search'].setValue('');
      }
    });

    // Check if sidebar should be open by default (optional)
    const savedSidebarState = this.StorageService.getLocalStorageItem('sidebarState');
    if (savedSidebarState !== null) {
      this.isSidebar = savedSidebarState === 'true';
    } else {
      this.isSidebar = true; // Default to open
    }
  }

  ngAfterContentInit(): void {
    // Additional initialization if needed
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.commonService.getImage().subscribe((data) => {
      this.image = data;
    });
  }

  /**
   * Initialize roles and permissions from local storage
   */
  initializeRolesAndPermissions(): void {
    const getRoleData = this.StorageService.getLocalStorageItem('setRole');
    this.getRoles = this.StorageService.getLocalStorageItem('role');
  }

  /**
   * Build menu list based on roles and permissions
   */
  buildMenuList(): void {
    const getRoleData = this.StorageService.getLocalStorageItem('setRole');
    this.getRoles = this.StorageService.getLocalStorageItem('role');

    let saveRole: any = null;
    try {
      saveRole = getRoleData ? JSON.parse(getRoleData) : null;
    } catch (error) {
      console.error("Failed to parse role data from local storage:", error);
    }

    if (!saveRole) {
      saveRole = {
        blog: { canCreate: false, canDelete: false, canEdit: false, canView: false },
        group: { canCreate: false, canDelete: false, canEdit: false, canView: false },
        member: { canOnboard: false, canDelete: false, canEdit: false, canView: false, canPromoteDemote: false },
        event: { canCreate: false, canDelete: false, canEdit: false, canView: false, canFrequency: false },
        announcement: { canCreate: false, canDelete: false, canEdit: false, canView: false },
        checkin: { canView: false, canCheck: false }
      };
    }

    // Check permissions
    const isBlog = (saveRole.blog.canCreate || saveRole.blog.canDelete || saveRole.blog.canEdit || saveRole.blog.canView);
    const isGroup = (saveRole.group.canCreate || saveRole.group.canDelete || saveRole.group.canEdit || saveRole.group.canView);
    const isUser = (saveRole.member.canOnboard || saveRole.member.canDelete || saveRole.member.canEdit || saveRole.member.canView || saveRole.member.canPromoteDemote);
    const isEvent = (saveRole.event.canCreate || saveRole.event.canDelete || saveRole.event.canEdit || saveRole.event.canView || saveRole.event.canFrequency);
    const isAnnouncement = (saveRole.announcement.canCreate || saveRole.announcement.canDelete || saveRole.announcement.canEdit || saveRole.announcement.canView);
    const isCheckIn = (saveRole.checkin.canView || saveRole.checkin.canCheck);
    const userId = this.StorageService.getLocalStorageItem('userId');
    this.menuList = [
      {
        id: 1, // 🔥 ADDED ID
        normalIcon: 'assets/images/side_menu_icon_1.png',
        activeIcon: 'assets/images/side_menu_icon_1_active.png',
        routerLink: '/dashboard',
        routerLinkActiveClass: 'active',
        content: [{ text: 'Dashboard', routerLink: '/dashboard' }],
      },
      {
        id: 2,
        normalIcon: 'assets/images/side_menu_icon_11.png',
        activeIcon: 'assets/images/side_menu_icon_11_active.png',
        routerLink: `/profile/my-profile/${userId}`,
        routerLinkActiveClass: 'active',
        content: [{ text: 'Basic', routerLink: `/profile/my-profile/${userId}` }],
        children: [
          { text: 'My Profile', routerLink: `/profile/my-profile/${userId}` },
          ...(this.getRoles !== 'usher' ? [
            { text: 'Roles & Permission', routerLink: `/role` },
          ] : []),
          ...(this.getRoles === 'Board Member' || this.getRoles === 'Executive Member' || this.getRoles === 'Member' || this.getRoles === 'Fan' ? [
            { text: 'Logged in Users', routerLink: `/login-user` }
          ] : [])
        ]
      },
      // Community Management - Made expandable for consistency
      ...(this.getRoles === 'Board Member' || this.getRoles === 'Executive Member' || this.getRoles === 'Member' || this.getRoles === 'Fan' ? [{
        id: 3, // 🔥 ADDED ID
        normalIcon: 'assets/images/side_menu_icon_4.png',
        activeIcon: 'assets/images/side_menu_icon_4_active.png',
        routerLink: '/community-management', // Parent route
        routerLinkActiveClass: 'active',
        content: [{ text: 'Community Management', routerLink: '/community-management/profile-edit' }],
        // children: [ // 🔥 ADDED CHILDREN
        //     { text: 'Profile Edit', routerLink: '/community-management/profile-edit' }
        // ]
      }] : []),
      // Members - Grouped all member-related routes here
      ...(isUser ? [{
        id: 4, // 🔥 ADDED ID
        normalIcon: 'assets/images/side_menu_icon_2.png',
        activeIcon: 'assets/images/side_menu_icon_2_active.png',
        routerLink: '/active-members', // Main link/parent route
        routerLinkActiveClass: 'active',
        content: [{ text: 'Members', routerLink: '/active-members' }],
        children: [ // 🔥 ADDED CHILDREN (Includes Groups, Mailing List, Member Request)
          { text: 'Member List', routerLink: '/active-members' },
          ...(isGroup ? [{ text: 'Groups', routerLink: '/groups' }] : []), // Keeping Groups logic nested
          { text: 'Mailing List', routerLink: '/email-template' },
          { text: 'Onboarding Member', routerLink: '/active-members/passive-users' },
          { text: 'Member Request', routerLink: '/request' },
        ]
      }] : []),

      {
        id: 5,
        normalIcon: 'assets/images/side_menu_icon_16.png',
        activeIcon: 'assets/images/side_menu_icon_16_active.png',
        routerLink: `community-management/edit-webpage/home`,
        routerLinkActiveClass: 'active',
        content: [{ text: 'Website', routerLink: `community-management/edit-webpage/home` }],
        children: [
          { text: 'Set up & Edit Webpage', routerLink: `community-management/edit-webpage/home` },
        ]
      },

      // Events
      ...(isEvent ? [{
        id: 5, // 🔥 ADDED ID
        normalIcon: 'assets/images/side_menu_icon_5.png',
        activeIcon: 'assets/images/side_menu_icon_5_active.png',
        routerLink: '/events',
        routerLinkActiveClass: 'active',
        content: [{ text: 'Events', routerLink: '/events' }],
        children: [
          { text: 'Event', routerLink: `/events` },
          ...(isBlog ? [
            { text: 'Blog', routerLink: `/blog` }
          ] : []),
          ...(isCheckIn ? [
            { text: 'Checkin List', routerLink: `/check-in` },
          ] : []),
        ]
      }] : []),
      
      // Announcements
      ...(isAnnouncement ? [{
        id: 6, // 🔥 ADDED ID
        normalIcon: 'assets/images/side_menu_icon_6.png',
        activeIcon: 'assets/images/side_menu_icon_6_active.png',
        routerLink: '/announcements',
        routerLinkActiveClass: 'active',
        content: [{ text: 'Announcements', routerLink: '/announcements' }],
      }] : []),

      // Emails & Messages
      ...(this.getRoles === 'Board Member' || this.getRoles === 'Executive Member' || this.getRoles === 'Member' || this.getRoles === 'Fan' ? [{
        id: 7, // 🔥 ADDED ID
        normalIcon: 'assets/images/side_menu_icon_7.png',
        activeIcon: 'assets/images/side_menu_icon_7_active.png',
        routerLink: '/message',
        routerLinkActiveClass: 'active',
        content: [{ text: 'Emails & Messages', routerLink: '/message' }],
      }] : []),
      // Blog
      // ...(isBlog ? [{
      //   id: 9, // 🔥 ADDED ID
      //   normalIcon: 'assets/images/side_menu_icon_8.png',
      //   activeIcon: 'assets/images/side_menu_icon_8_active.png',
      //   routerLink: '/blog',
      //   routerLinkActiveClass: 'active',
      //   content: [{ text: 'Blog', routerLink: '/blog' }],
      // }] : []),

      // Logged in users
      // ...(this.getRoles === 'Board Member' || this.getRoles === 'Executive Member' || this.getRoles === 'Member' || this.getRoles === 'Fan' ? [{
      //   id: 10, // 🔥 ADDED ID
      //   normalIcon: 'assets/images/side_menu_icon_9.png',
      //   activeIcon: 'assets/images/side_menu_icon_9_active.png',
      //   routerLink: '/login-user',
      //   routerLinkActiveClass: 'active',
      //   content: [{ text: 'Logged in users', routerLink: '/login-user' }],
      // }] : []),

      // Checkin List
      // ...(isCheckIn ? [{
      //   id: 12, // 🔥 ADDED ID
      //   normalIcon: 'assets/images/side_menu_icon_12.png',
      //   activeIcon: 'assets/images/side_menu_icon_12_active.png',
      //   routerLink: '/check-in',
      //   routerLinkActiveClass: 'active',
      //   content: [{ text: 'Checkin List', routerLink: '/check-in' }],
      // }] : []),


      // Roles & Permission
      // ...(this.getRoles !== 'usher' ? [{
      //   id: 13, // 🔥 ADDED ID
      //   normalIcon: 'assets/images/side_menu_icon_13.png',
      //   activeIcon: 'assets/images/side_menu_icon_13_active.png',
      //   routerLink: '/role',
      //   routerLinkActiveClass: 'active',
      //   content: [{ text: 'Roles & Permission', routerLink: '/role' }],
      // }] : []),

      // Activity Log - Grouped the two Activity Log routes
      ...(this.getRoles === 'Board Member' || this.getRoles === 'Executive Member' || this.getRoles === 'Member' || this.getRoles === 'Fan' ? [{
        id: 14, // 🔥 ADDED ID
        normalIcon: 'assets/images/side_menu_icon_14.png',
        activeIcon: 'assets/images/side_menu_icon_14_active.png',
        routerLink: '/activity-log/app', // Parent route
        routerLinkActiveClass: 'active',
        content: [{ text: 'Activity Log', routerLink: '/activity-log/app' }], // Use one of the children links as the default
        children: [ // 🔥 ADDED CHILDREN
          { text: 'Activity Log App', routerLink: '/activity-log/app' },
          { text: 'Activity Log .Net', routerLink: '/activity-log/.net' },
          { text: ' Analytics', routerLink: '/event-analytics' }
        ]
      }] : []),

     

    ];
  }

  // 🔥 ADDED: Handles toggling and navigation for menu items
  toggleSubMenu(menuId: any, routerLink: string | undefined, hasChildren: boolean): void {
    // 1. If it has children, toggle the expanded state
    if (hasChildren) {
      // Toggle expansion: if it's the current expanded menu, collapse it (set to null), otherwise expand it
      this.expandedMenuId = this.expandedMenuId === menuId ? null : menuId;
      this.isSidebar = true
    }

    // 2. If it does NOT have children, or if the user clicks a parent link directly, navigate.
    // We only navigate directly if it doesn't have children, OR if the menu is already expanded (allowing a second click to navigate to the parent's default route)
    if (routerLink && (!hasChildren || this.expandedMenuId === menuId)) {
      this.router.navigateByUrl(routerLink);
      this.removeClass(routerLink);
    }
  }

  // 🔥 ADDED: Checks the current route and automatically expands the parent menu
  // checkCurrentRouteForExpansion(): void {
  //   let newExpandedId = null;

  //   // 1. Check if the current route is a child of any menu item
  //   const parentOfChild = this.menuList.find((menu: any) =>
  //     menu.children && menu.children.some((child: any) => this.currentRoute.includes(child.routerLink))
  //   );

  //   if (parentOfChild) {
  //     // If it's a child route (e.g., /groups/list), expand the parent (e.g., Members)
  //     newExpandedId = parentOfChild.id;
  //   } else {
  //     // 2. Check if the current route is the primary route of a parent menu item
  //     const activeParent = this.menuList.find((menu: any) =>
  //       menu.children && this.currentRoute === menu.routerLink
  //     );
  //     if (activeParent) {
  //       newExpandedId = activeParent.id;
  //     }
  //   }

  //   this.expandedMenuId = newExpandedId;
  // }

  checkCurrentRouteForExpansion(): void {
  // Prevent crash if menuList is not ready
  if (!this.menuList || !Array.isArray(this.menuList)) {
    console.warn("menuList not ready yet");
    return;
  }

  let newExpandedId = null;

  // 1. Check if the current route is a child of any menu item
  const parentOfChild = this.menuList.find((menu: any) =>
    menu.children && menu.children.some((child: any) => this.currentRoute.includes(child.routerLink))
  );

  if (parentOfChild) {
    newExpandedId = parentOfChild.id;
  } else {
    // 2. Check if current route matches parent's routerLink
    const activeParent = this.menuList.find((menu: any) =>
      menu.children && this.currentRoute === menu.routerLink
    );
    if (activeParent) {
      newExpandedId = activeParent.id;
    }
  }

  this.expandedMenuId = newExpandedId;
}


  // ... rest of the component methods ...
  // Keep the rest of the existing methods below...

  generateSearchForm(): void {
    this.searchForm = new FormGroup({
      search: new FormControl(''),
    });
  }

  removeClass(routerLink: any): void {
    this.currentRoute = routerLink;
    this.paramService.updatecurrentRoute(this.currentRoute);
  }

  logout(): void {
    this.authService.logout();
  }

  viewProfile(): void {
    const userId = this.StorageService.getLocalStorageItem('userId');
    this.paramService.updatecurrentRoute('/active-members/my-profile/' + userId);
    this.router.navigateByUrl('/active-members/my-profile/' + userId);
  }

  editProfile(): void {
    this.paramService.updatecurrentRoute('/community-management/profile-edit');
    this.router.navigateByUrl('/community-management/profile-edit');
  }

  switchCommunity(id: any, logoImage: any): void {
    this.$modal.hide();
    this.communityService.switchCommunity(id);
    this.currentRoute = "/dashboard";
    this.commonService.sendValue(id);
    this.commonService.sendImage(logoImage);
    this.searchForm.controls['search'].setValue('');
  }

  switchCommunityOpenModal(): void {
    if (this.communities?.length === 1) {
      this.alertService.error("You have connected to only one community");
      return;
    } else {
      this.$modal = new window.bootstrap.Modal(
        document.getElementById("switchingCommunitity")
      );
      if (!this.StorageService.getLocalStorageItem('communtityId')) {
        this.StorageService.removeLocalItem('communtityId');
      }
      this.communitityList();
      this.$modal.show();
    }
  }

  showNotification(): void {
    this.ShowComingNotificaton = false;
    this.notificationList();
    this.loaderService.show();
    setTimeout(() => {
      this.loaderService.hide();
      this.$modal = new window.bootstrap.Modal(
        document.getElementById("notficationCommunitity")
      );
      this.$modal.show();
      this.loaderService.hide();
    }, 1000);
  }

  communitityList(): void {
    this.apolloClient.setModule('switchOrganizationList').queryData().subscribe((response: GeneralResponse) => {
      if (response.error) {
        this.alertService.error(response.message);
        return;
      } else {
        this.communities = response.data;
        this.comName = this.communities[0].communityName ? this.communities[0].communityName : this.StorageService.getLocalStorageItem('communityName');
        this.communityId = this.communities[0].id;
        this.length = this.communities?.length;
        this.comId = this.StorageService.getLocalStorageItem('communtityId');
        this.commonService.sendData(this.StorageService.getLocalStorageItem('communtityId'));
        this.StorageService.setLocalStorageItem('role', this.communities[0]?.role);
        this.getRole(this.communities[0].id, this.communities[0]?.role);
      }
    });
  }

  getRole(communityId: any, role: any): void {
    const params: any = {};
    params['data'] = {
      communityId: communityId,
      role: role
    };

    this.apolloClient.setModule('getRolePermissions').queryData(params).subscribe((response: GeneralResponse) => {
      if (response.error) {
        this.loaderService.hide();
        this.alertService.error(response.message);
        return;
      } else {
        this.roleData = response.data;
        this.StorageService.setLocalStorageItem("setRole", {
          blog: this.roleData?.blog,
          event: this.roleData?.event,
          group: this.roleData?.group,
          member: this.roleData?.member,
          announcement: this.roleData?.announcement,
          checkin: this.roleData?.checkin,
        });
        this.updateMenuList();
        this.loaderService.hide();
      }
    });
  }

  updateMenuList(): void {
    this.buildMenuList();
    this.checkCurrentRouteForExpansion(); // 🔥 ADDED: Check expansion after menu rebuild
  }

  globalSearch(): void {
    this.router.navigateByUrl('/search/global');
    this.paramService.updatecurrentRoute('/search/global');
    const searchData = this.searchForm.value.search ? this.searchForm.value.search.trim() : '';
    const params: any = {};
    params['data'] = {
      search: searchData ? searchData : ''
    };

    this.loaderService.show();
    if (this.sub && !this.sub.closed) {
      this.sub.unsubscribe();
    }

    this.sub = this.apolloClient.setModule('myCommunityDotNetGlobalSearch').queryData(params).subscribe((response: GeneralResponse) => {
      if (response.error) {
        this.alertService.error(response.message);
        return;
      } else {
        this.commonService.sendData(response.data);
      }
    });
    this.loaderService.hide();
  }

  feedbackSearch(): void {
    this.paramService.updatecurrentRoute('/message/feedback/' + this.searchForm.value.search);
    this.router.navigateByUrl('/message/feedback/' + this.searchForm.value.search);
  }

  announcementSearch(): void {
    this.paramService.updatecurrentRoute('/announcements/list/' + this.searchForm.value.search);
    this.router.navigateByUrl('/announcements/list/' + this.searchForm.value.search);
  }

  groupSearch(): void {
    this.paramService.updatecurrentRoute('/groups/list/' + this.searchForm.value.search);
    this.router.navigateByUrl('/groups/list/' + this.searchForm.value.search);
  }

  EventSearch(): void {
    this.paramService.updatecurrentRoute('/events/list/' + this.searchForm.value.search);
    this.router.navigateByUrl('/events/list/' + this.searchForm.value.search);
  }

  clearSearch(): void {
    this.searchForm.controls['search'].setValue('');
    this.globalSearch();
  }

  notificationList(): void {
    const params: any = {};
    params['data'] = {
      deviceType: "web",
      domains: ".net",
      page: null,
      search: null
    };

    this.loaderService.show();
    this.apolloClient.setModule('getAllNotifications').queryData(params).subscribe((response: GeneralResponse) => {
      if (response.error) {
        this.alertService.error(response.message);
        return;
      } else {
        this.notificationDetails = response.data.notifications;
        this.notificationLength = this.notificationDetails.length;
      }
    });

    this.loaderService.hide();
    this.hasNewNotifications = false;
  }

  getMessage(event: any): void {
    this.hasNewNotifications = true;
  }

  closeModal(): void {
    this.$modal.hide();
    window.location.reload();
  }

  /**
   * Toggle sidebar open/close state
   * @param getVal - Boolean value to set sidebar state
   */
  openSidebar(getVal: boolean): void {
    this.isSidebar = getVal;
    // Optionally save state to localStorage
    this.StorageService.setLocalStorageItem('sidebarState', String(getVal));
  }

  /**
   * Check if a route is currently active
   * @param routerLink - The router link to check
   * @returns Boolean indicating if route is active
   */
  isRouteActive(menu: any): boolean {
    if (!menu) return false;

    // ---- Check parent route ----
    if (menu.routerLink && typeof menu.routerLink === 'string') {
      if (this.currentRoute.includes(menu.routerLink)) {
        return true;
      }
    }

    // ---- Check children routes ----
    if (menu.children && Array.isArray(menu.children)) {
      return menu.children.some(
        (child: any) =>
          child.routerLink &&
          typeof child.routerLink === 'string' &&
          this.currentRoute.includes(child.routerLink)
      );
    }

    return false;
  }

}