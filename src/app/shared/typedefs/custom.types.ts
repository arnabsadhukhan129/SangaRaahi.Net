/**
 * This file should contain all the custom object type that this project will use.
 * Add more types as you move on to the project
 */

import { CommunityType, MemberPromotionType, PromotionStatus, RolesEnum } from '../enums/common.enums'

/**
 * For User Type
 */
export type User = {
  id:String
  name:String
  contact:email
}

export type UserMain = {
  id: String,
  name: String,
  email: String,
  phone: String,
  profileImage : String
  gender: String,
  userType: String,
  address:String,
  firstAddressLine:String,
  city:String,
  zipcode:String,
  dateOfBirth: DateOfBirthType,
  isActive: Boolean
}

export type CountryCodes = {
  name: String,
  dialCode: String,
  code: String,
  flag: String,
}

type DateOfBirthType = {
  value: String,
  isMasked: Boolean
}
           

type email = { 
  email: address
}
type address = {
  address: String
}



export type Path = {
  from:String,
  to:String
}
export type MemberPromotion = {
  type: MemberPromotionType,
  date: String,
  status: PromotionStatus,
  path:Path,
  authorizePersonId:String
}

export type CommunityMember = {
  memberId: String,
  roles:[RolesEnum],
  isApproved:Boolean,
  isRejected:Boolean,
  memberPromotion:[MemberPromotion],
  isActive: Boolean,
  isDeleted: Boolean,
  isLeaved: Boolean,
  joinedAt:String,
  updatedAt:String,
  leaveAt:String
}
export type OwnerDetails = {
  id:String
  name:String
}
type LocationCommunity ={
  location:String,
  latitude:number,
  longitude:number
}
export type Community = {
  id: String,
  ownerId: String,
  communityType:CommunityType,
  bannerImage:String,
  communityName:String,
  communityDescription: String,
  communityLocation:LocationCommunity,
  address:AddressDetails,
  nonProfit?:Boolean,
  nonProfitTaxId?:String,
  members?:[CommunityMember],
  isActive:Boolean,
  isDeleted?:Boolean,
  expiredAt?:String,
  createdAt?:String,
  updatedAt?:String
  ownerDetails?:OwnerDetails
}

export type AddressDetails = {
  firstAddressLine:String,
  secondAddressLine:String,
  city:String,
  state:String,
  country:String,
  zipcode:String
}

export type CommunityMemberList = {
  id:String,
  members:MemberDetails
}

type MemberDetails = {
  roles:String,
  joinedAt:String,
  user:UserDetails
}

type UserDetails = {
  id: String,
  name: String,
  email: String,
  phone: String,
  profileImage:String
}


/**
 * For Group Type
 */

export type Group = {
  id:String,
  name: String,
  description: String,
  image: String,
  createdBy: String,
  communityId: String,
  isActive: Boolean
}

export type GroupMember = {
  memberId?: String,
  roles: [String]
}

export type GroupMemberByID = {
  userId: String,
  name: String,
  email: String,
  roles: [String]
}

export type GroupMemberList = {
  id:String,
  name:String,
  members:MemberDetails
}

/**
 * For Announcement Type
 */
export type Announcement = {
  id:string,
  userId: String,
  title: String,
  description: String,
  endDate: String,
  toWhom:String,
  communityId:String
  isActive:Boolean,
  community:Community,
  user:UserMain
}


/**
 * For Event Type
 */

export type Event = {
  id: String,
  hostId: String,
  communityId:String,
  groupId:String,
  category: String,
  postEventAsCommunity:Boolean
  type:String,
  title:String,
  description:String,
  image:String,
  venueDetails:VenueDetails,
  invitationType:String,
  rsvpEndTime:String,
  date:Date,
  time:Date,
  rsvp:[Rsvp],
  attendees:Attendees,
  isJoined:Boolean
  isActive:Boolean
  user:UserMain
  community:Community
}

type VenueDetails = {
  firstAddressLine:String,
  secondAddressLine:String,
  city:String,
  state:String,
  country:String,
  zipcode:String,
  phoneNo:String
}

type Date = {
  from:String,
  to:String
}

type Rsvp = {
  userId:String,
  status:String,
  guests:Guests,
  createdAt:String,
  updatedAt:String
  user:UserMain
}

type Guests = {
  adults:Number,
  minor:Number,
  total:Number,
  familyMembers:[FamilyMembers],
}

type FamilyMembers = {
  userId: String,
  name: String,
  relation: String
}

type Attendees = {
  isRestricted:Boolean,
  numberOfMaxAttendees:Number,
  additionalGuests:Boolean,
  numberOfMaxGuests:Number,
  attendeesListVisibility:String,
  mediaUploadByAttendees:Boolean,
  eventImages:EventImages,
  isActive:Boolean,
  isDeleted:Boolean,
  createdAt:String,
  updatedAt:String,
}

type EventImages = {
  imageName:String
  url:String
  userId:String,
  uploadedAt:String,
  isDeleted:Boolean,
  isActive:Boolean,
}

type Subject = {
  id:String,
  subject: SubjectData
}

type SubjectData = {
  data:String,
  lang:String
}

export type Feedback = {
  id:String,
  subject:Subject,
  name:String,
  email:String,
  message:String,
  isActive:Boolean,
  isReplied:Boolean
}

export type communities = {
      id: string
      logoImage: string
      communityName: string
      communityDescription: string,
      role: string
}

export type ActiveMemberList = {
  // id: string,
  // communityName: string,
  // members: {
  //   memberId: string,
  //   roles: string,
  //   joinedAt: string,
  //   isActive: Boolean,
  //   isDeleted: Boolean,
  //   user:{
  //     id: string,
  //     name: string,
  //     email: string,
  //     phone: string,
  //     profileImage: string
  //   }
  // }
  total: number,
  members: [
    {
      communityName: string,
      id: string,
      isResend: boolean,
      members: {
        user: {
          profileImage: string,
          phone: string,
          name: string,
          id: string,
          email: string
        },
        roles: string,
        memberId: string,
        joinedAt: string,
        isActiveDeletePermission: boolean,
        isActive: boolean,
        invitationDate: string,
        acknowledgementStatus: string,
        acknowledgementDate: string
      }
    }
  ]
}

export type ActiveMemberDetails = {
      id: string,
      name: string,
      email: string,
      phone: string,
      countryCode: string,
      phoneCode: string,
      profileImage: string,
      userType: string,
      isEmailVerified: boolean,
      isPhoneVerified: boolean,
      address: string,
      firstAddressLine: string,
      secondAddressLine: string,
      country: string,
      city: string,
      state: string,
      zipcode: string,
      latitude: string,
      longitude: string,
      isMasked: boolean,
      gender: string
      hobbies: [],
      areaOfWork: [],
      profession: [],
      aboutYourself: string,
      selectedCommunity: string,
      isActive: boolean,
      dateOfBirth: {
        value: string
        isMasked: boolean
      },
      familyMembers: any,
      // familyMembers: {
      //   id: string,
      //   userId: string,
      //   ageOfMinority: string
      //   relationType: string,
      //   memberName: string,
      //   memberImage: string,
      //   phone: string,
      //   phoneCode: string,
      //   countryCode: string,
      // },
      contacts: {
        id : string,
        userId: string,
        contactName: string,
        contactImage: string,
        contactPhone: string,
        isDeleted: boolean,
        user: {
          contact: {
            first_address_line: string,
            second_address_line: string,
            city: string,
            state: string,
            zipcode: string
            latitude: string
            longitude: string
          }
        }
      }
  }

