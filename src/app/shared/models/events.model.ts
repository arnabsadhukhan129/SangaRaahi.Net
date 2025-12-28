interface VenueDetails{
    firstAddressLine: string,
    secondAddressLine: string,
    city: string,
    state: string,
    country: string,
    zipcode: string,
    phoneNo: string
  }

interface Date{
    from: string,
    to: string
  }

interface Time{
    from: string,
    to: string
  }

  interface Community{
    id: string,
    ownerId: string,
    communityName: string
  }

export interface Event {
    id: string,
    hostId: string,
    communityId: string,
    groupId: string,
    category: string,
    postEventAsCommunity: boolean,
    type: string,
    title: string,
    description: string,
    venueDetails: VenueDetails,
    invitationType: string,
    rsvpEndTime: string,
    date: Date,
    time: Time,
    community: Community,
    isActive: string, //boolean,
    isCancelled: boolean
    image : string,
    createdAt: string,
    recurringEvent: boolean
}

interface venueDetails
{
  firstAddressLine: string,
  secondAddressLine: string,
  city: string,
  state: string,
  country: string,
  zipcode: string,
  phoneNo: string
}


export interface EventFormData {
    type: string,
    title: string,
    description: string,
    image: string,
    venueDetails: venueDetails, 
    // "date": {
    //   "from": "2023-07-23",
    //   "to": "2023-07-25"
    // },
    // "time": {
    //   "from": "10:00",
    //   "to": "2:00"
    // },
    // "invitationType": "Public",
    // "rsvpEndTime": "2023-07-22",
    // "restrictNumberAttendees": false,
    // "postEventAsCommunity": true,
    // "attendeeListVisibilty": true,
    // "collectEventPhotos": true,
    // "numberOfMaxAttendees": 50
  
}
