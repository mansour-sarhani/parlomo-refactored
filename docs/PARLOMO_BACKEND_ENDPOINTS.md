# Parlomo API Endpoint Inventory

Total unique endpoints: 150

Generated automatically from parlomo-front legacy codebase. Methods reflect usage in Redux thunks/services.

## admin/badge-package

- **GET** /api/admin/badge-package
  - References: `parlomo-front/redux/features/badgeSlice.js`

## admin/banner

- **GET, POST** /api/admin/banner
  - References: `parlomo-front/redux/features/bannerSlice.js`
- **POST** /api/admin/banner/${banner.id}
  - References: `parlomo-front/redux/features/bannerSlice.js`

## admin/classified-ad

- **GET** /api/admin/classified-ad
  - References: `parlomo-front/redux/features/adSlice.js`, `parlomo-front/redux/features/globalSlice.js`
- **GET** /api/admin/classified-ad/${postId}
  - References: `parlomo-front/redux/features/adSlice.js`

## admin/classified-ad-attribute

- **GET** /api/admin/classified-ad-attribute
  - References: `parlomo-front/redux/features/adAttributeSlice.js`
- **GET** /api/admin/classified-ad-attribute/${attributeId}
  - References: `parlomo-front/redux/features/adAttributeSlice.js`

## admin/classified-ad-attribute?list=all

- **GET** /api/admin/classified-ad-attribute?list=all
  - References: `parlomo-front/redux/features/adAttributeSlice.js`

## admin/classified-ad-category

- **GET** /api/admin/classified-ad-category
  - References: `parlomo-front/redux/features/adCategorySlice.js`
- **GET** /api/admin/classified-ad-category/${categoryId}
  - References: `parlomo-front/redux/features/adCategorySlice.js`

## admin/classified-ad-category-all

- **GET** /api/admin/classified-ad-category-all
  - References: `parlomo-front/redux/features/adCategorySlice.js`

## admin/classified-ad-type

- **GET** /api/admin/classified-ad-type
  - References: `parlomo-front/redux/features/adTypeSlice.js`
- **GET** /api/admin/classified-ad-type/${typeId}
  - References: `parlomo-front/redux/features/adTypeSlice.js`

## admin/classified-ad-type?list=all

- **GET** /api/admin/classified-ad-type?list=all
  - References: `parlomo-front/redux/features/adTypeSlice.js`

## admin/directory

- **GET** /api/admin/directory
  - References: `parlomo-front/redux/features/directorySlice.js`, `parlomo-front/redux/features/globalSlice.js`
- **GET** /api/admin/directory/${postId}
  - References: `parlomo-front/redux/features/directorySlice.js`
- **POST** /api/admin/directory/change
  - References: `parlomo-front/redux/features/directorySlice.js`

## admin/directory-category

- **GET** /api/admin/directory-category
  - References: `parlomo-front/redux/features/directorySlice.js`
- **GET** /api/admin/directory-category/${categoryId}
  - References: `parlomo-front/redux/features/directorySlice.js`

## admin/directory-category?list=all

- **GET** /api/admin/directory-category?list=all
  - References: `parlomo-front/redux/features/directorySlice.js`

## admin/directory-category?list=allEdit

- **GET** /api/admin/directory-category?list=allEdit
  - References: `parlomo-front/redux/features/directorySlice.js`

## admin/directory?list=all

- **GET** /api/admin/directory?list=all
  - References: `parlomo-front/redux/features/directorySlice.js`

## admin/review

- **GET** /api/admin/review/ads
  - References: `parlomo-front/redux/features/reviewSlice.js`
- **POST** /api/admin/review/ads/${data.id}
  - References: `parlomo-front/redux/features/reviewSlice.js`
- **GET** /api/admin/review/ads/${id}
  - References: `parlomo-front/redux/features/reviewSlice.js`
- **GET** /api/admin/review/comment
  - References: `parlomo-front/redux/features/reviewSlice.js`
- **POST** /api/admin/review/comment/${data.id}
  - References: `parlomo-front/redux/features/reviewSlice.js`
- **GET** /api/admin/review/directory-listing
  - References: `parlomo-front/redux/features/reviewSlice.js`
- **POST** /api/admin/review/directory-listing/${data.id}
  - References: `parlomo-front/redux/features/reviewSlice.js`
- **GET** /api/admin/review/directory-listing/${id}
  - References: `parlomo-front/redux/features/reviewSlice.js`
- **POST** /api/admin/review/event/${event.id}
  - References: `parlomo-front/redux/features/eventsSlice.js`

## admin/show-category

- **GET** /api/admin/show-category/${categoryId}
  - References: `parlomo-front/redux/features/eventsSlice.js`

## admin/show-category-list

- **GET** /api/admin/show-category-list
  - References: `parlomo-front/redux/features/eventsSlice.js`

## admin/show-event

- **GET** /api/admin/show-event/${eventId}
  - References: `parlomo-front/redux/features/eventsSlice.js`

## admin/show-event-list

- **GET** /api/admin/show-event-list
  - References: `parlomo-front/redux/features/eventsSlice.js`, `parlomo-front/redux/features/globalSlice.js`

## badgePackage

- **GET, POST** /api/badgePackage
  - References: `parlomo-front/redux/features/badgeSlice.js`
- **POST** /api/badgePackage/${badge.id}
  - References: `parlomo-front/redux/features/badgeSlice.js`
- **GET** /api/badgePackage/${badgeId}
  - References: `parlomo-front/redux/features/badgeSlice.js`

## badgePackage?type=${type}

- **GET** /api/badgePackage?type=${type}
  - References: `parlomo-front/redux/features/directorySlice.js`

## banner?${data}=true

- **GET** /api/banner?${data}=true
  - References: `parlomo-front/redux/features/globalSlice.js`

## bookmark

- **GET, POST** /api/bookmark/ads
  - References: `parlomo-front/redux/features/globalSlice.js`
- **GET, POST** /api/bookmark/directory
  - References: `parlomo-front/redux/features/globalSlice.js`
- **GET, POST** /api/bookmark/event
  - References: `parlomo-front/redux/features/globalSlice.js`

## classified-ad

- **GET, POST** /api/classified-ad
  - References: `parlomo-front/redux/features/adSlice.js`, `parlomo-front/redux/features/globalSlice.js`
- **POST** /api/classified-ad/${data.id}
  - References: `parlomo-front/redux/features/adSlice.js`
- **GET** /api/classified-ad/${slug}
  - References: `parlomo-front/redux/features/adSlice.js`
- **GET** /api/classified-ad/front/list
  - References: `parlomo-front/redux/features/adSlice.js`
- **GET** /api/classified-ad/front/list?type=${id}
  - References: `parlomo-front/redux/features/adSlice.js`
- **POST** /api/classified-ad/new/verify-code
  - References: `parlomo-front/redux/features/adSlice.js`
- **GET** /api/classified-ad/own/list
  - References: `parlomo-front/redux/features/adSlice.js`
- **GET** /api/classified-ad/own/single/${postId}
  - References: `parlomo-front/redux/features/adSlice.js`
- **POST** /api/classified-ad/verify-ads
  - References: `parlomo-front/redux/features/adSlice.js`

## classified-ad-attribute

- **POST** /api/classified-ad-attribute
  - References: `parlomo-front/redux/features/adAttributeSlice.js`
- **POST** /api/classified-ad-attribute/${attribute.id}
  - References: `parlomo-front/redux/features/adAttributeSlice.js`

## classified-ad-category

- **GET, POST** /api/classified-ad-category
  - References: `parlomo-front/redux/features/adCategorySlice.js`, `parlomo-front/redux/features/adSlice.js`
- **POST** /api/classified-ad-category/${category.id}
  - References: `parlomo-front/redux/features/adCategorySlice.js`
- **POST** /api/classified-ad-category/add-attribute
  - References: `parlomo-front/redux/features/adAttributeSlice.js`
- **POST** /api/classified-ad-category/delete-attribute
  - References: `parlomo-front/redux/features/adAttributeSlice.js`
- **GET** /api/classified-ad-category/get-attribute/${categoryId}
  - References: `parlomo-front/redux/features/adAttributeSlice.js`

## classified-ad-category?categoryId=${categoryId}

- **GET** /api/classified-ad-category?categoryId=${categoryId}
  - References: `parlomo-front/redux/features/adCategorySlice.js`

## classified-ad-category?typeId=${typeId}

- **GET** /api/classified-ad-category?typeId=${typeId}
  - References: `parlomo-front/redux/features/adCategorySlice.js`

## classified-ad-type

- **POST** /api/classified-ad-type
  - References: `parlomo-front/redux/features/adTypeSlice.js`
- **POST** /api/classified-ad-type/${type.id}
  - References: `parlomo-front/redux/features/adTypeSlice.js`

## classified-ad-type?list=all

- **GET** /api/classified-ad-type?list=all
  - References: `parlomo-front/redux/features/adTypeSlice.js`

## classified-ad?similar=true&category=${id}

- **GET** /api/classified-ad?similar=true&category=${id}
  - References: `parlomo-front/redux/features/adSlice.js`

## confirm-payment

- **POST** /api/confirm-payment/${invoiceId}
  - References: `parlomo-front/redux/features/paymentSlice.js`

## contact-us

- **POST** /api/contact-us
  - References: `parlomo-front/redux/features/globalSlice.js`

## conversations

- **GET** /api/conversations
  - References: `parlomo-front/redux/features/chatSlice.js`
- **POST** /api/conversations/deleteByConversationsById
  - References: `parlomo-front/redux/features/chatSlice.js`
- **POST** /api/conversations/loadMessage
  - References: `parlomo-front/redux/features/chatSlice.js`
- **POST** /api/conversations/sendMessageToUserByUserId
  - References: `parlomo-front/redux/features/chatSlice.js`

## directory

- **GET, POST** /api/directory
  - References: `parlomo-front/redux/features/directorySlice.js`, `parlomo-front/redux/features/globalSlice.js`
- **POST** /api/directory/${post.id}
  - References: `parlomo-front/redux/features/directorySlice.js`
- **GET** /api/directory/${slug}
  - References: `parlomo-front/redux/features/directorySlice.js`
- **POST** /api/directory/buy/badge
  - References: `parlomo-front/redux/features/badgeSlice.js`
- **GET** /api/directory/list/sponsored
  - References: `parlomo-front/redux/features/directorySlice.js`
- **GET** /api/directory/own/my-directory
  - References: `parlomo-front/redux/features/directorySlice.js`
- **GET** /api/directory/own/my-directory?list=all
  - References: `parlomo-front/redux/features/directorySlice.js`
- **GET** /api/directory/own/single/${id}
  - References: `parlomo-front/redux/features/directorySlice.js`

## directory-category

- **POST** /api/directory-category
  - References: `parlomo-front/redux/features/directorySlice.js`
- **POST** /api/directory-category/${category.id}
  - References: `parlomo-front/redux/features/directorySlice.js`

## directory-category?categoryId=${categoryId}

- **GET** /api/directory-category?categoryId=${categoryId}
  - References: `parlomo-front/redux/features/directorySlice.js`

## directory-category?list=all

- **GET** /api/directory-category?list=all
  - References: `parlomo-front/redux/features/directorySlice.js`

## directory?category=${categoryId}

- **GET** /api/directory?category=${categoryId}
  - References: `parlomo-front/redux/features/directorySlice.js`

## directory?category=${categoryId}&related=true

- **GET** /api/directory?category=${categoryId}&related=true
  - References: `parlomo-front/redux/features/directorySlice.js`

## discount-codes

- **GET, POST** /api/discount-codes
  - References: `parlomo-front/redux/features/discountSlice.js`
- **POST** /api/discount-codes/${data.id}
  - References: `parlomo-front/redux/features/discountSlice.js`
- **POST** /api/discount-codes/apply
  - References: `parlomo-front/redux/features/discountSlice.js`
- **POST** /api/discount-codes/remove
  - References: `parlomo-front/redux/features/discountSlice.js`

## event

- **GET, POST** /api/event
  - References: `parlomo-front/redux/features/eventsSlice.js`
- **POST** /api/event/${event.id}
  - References: `parlomo-front/redux/features/eventsSlice.js`
- **GET** /api/event/${slug}
  - References: `parlomo-front/redux/features/eventsSlice.js`
- **GET** /api/event/admin/pending-event
  - References: `parlomo-front/redux/features/eventsSlice.js`
- **POST** /api/event/own-event/${event.id}
  - References: `parlomo-front/redux/features/eventsSlice.js`

## event-Category

- **GET, POST** /api/event-Category
  - References: `parlomo-front/redux/features/eventsSlice.js`
- **POST** /api/event-Category/${category.id}
  - References: `parlomo-front/redux/features/eventsSlice.js`

## event?list=all

- **GET** /api/event?list=all
  - References: `parlomo-front/redux/features/eventsSlice.js`

## external

- **GET** https://api.parlomo.co.uk/api/auth/callback?${queryUrl}
  - References: `parlomo-front/redux/features/authSlice.js`
- **GET** https://api.parlomo.co.uk/api/classified-ad/${params.slug}
  - References: `parlomo-front/pages/ad/[slug].js`
- **GET** https://api.parlomo.co.uk/api/directory-category/${params.slug}
  - References: `parlomo-front/pages/directory-category/[slug].js`
- **GET** https://api.parlomo.co.uk/api/directory/${params.slug}
  - References: `parlomo-front/pages/directory/[slug].js`
- **GET** https://api.parlomo.co.uk/api/event/${params.slug}
  - References: `parlomo-front/pages/event/[slug].js`

## forget-password-change

- **POST** /api/forget-password-change
  - References: `parlomo-front/redux/features/authSlice.js`

## forget-password-send-code

- **POST** /api/forget-password-send-code
  - References: `parlomo-front/redux/features/authSlice.js`

## forget-password-verify-code

- **POST** /api/forget-password-verify-code
  - References: `parlomo-front/redux/features/authSlice.js`

## front

- **GET** /api/front/postcode?postcode=${postcode}
  - References: `parlomo-front/redux/features/directorySlice.js`

## login

- **POST** /api/login
  - References: `parlomo-front/redux/features/authSlice.js`

## omid-advertising

- **GET, POST** /api/omid-advertising
  - References: `parlomo-front/redux/features/advertisingSlice.js`
- **POST** /api/omid-advertising/${data.id}
  - References: `parlomo-front/redux/features/advertisingSlice.js`
- **GET** /api/omid-advertising/admin-list
  - References: `parlomo-front/redux/features/advertisingSlice.js`

## omid-advertising-order

- **POST** /api/omid-advertising-order/${data.id}
  - References: `parlomo-front/redux/features/advertisingSlice.js`
- **GET** /api/omid-advertising-order/admin-list
  - References: `parlomo-front/redux/features/advertisingSlice.js`
- **POST** /api/omid-advertising-order/buy
  - References: `parlomo-front/redux/features/advertisingSlice.js`
- **GET** /api/omid-advertising-order/front?placeType=${banner}
  - References: `parlomo-front/redux/features/bannerSlice.js`
- **GET** /api/omid-advertising-order/own-list
  - References: `parlomo-front/redux/features/advertisingSlice.js`

## omid-advertising-type

- **POST** /api/omid-advertising-type
  - References: `parlomo-front/redux/features/advertisingSlice.js`
- **POST** /api/omid-advertising-type/${data.id}
  - References: `parlomo-front/redux/features/advertisingSlice.js`
- **GET** /api/omid-advertising-type/admin-list
  - References: `parlomo-front/redux/features/advertisingSlice.js`
- **GET** /api/omid-advertising-type/admin-list/${id}
  - References: `parlomo-front/redux/features/advertisingSlice.js`

## omid-advertising-type?list=all

- **GET** /api/omid-advertising-type?list=all
  - References: `parlomo-front/redux/features/advertisingSlice.js`

## omid-advertising?typeId=${id}

- **GET** /api/omid-advertising?typeId=${id}
  - References: `parlomo-front/redux/features/advertisingSlice.js`

## postcode

- **POST** /api/postcode/verify
  - References: `parlomo-front/redux/features/globalSlice.js`

## register

- **POST** /api/register
  - References: `parlomo-front/redux/features/authSlice.js`

## report

- **GET** /api/report/admin/my-invoice
  - References: `parlomo-front/redux/features/reportsSlice.js`
- **GET** /api/report/my-invoice
  - References: `parlomo-front/redux/features/reportsSlice.js`

## reviews

- **GET** /api/reviews
  - References: `parlomo-front/redux/features/globalSlice.js`
- **POST** /api/reviews/directory
  - References: `parlomo-front/redux/features/globalSlice.js`
- **GET** /api/reviews/directory/${id}
  - References: `parlomo-front/redux/features/globalSlice.js`
- **POST** /api/reviews/directory/replay
  - References: `parlomo-front/redux/features/globalSlice.js`

## setting

- **POST** /api/setting
  - References: `parlomo-front/redux/features/globalSlice.js`

## setting?key=${key}

- **GET** /api/setting?key=${key}
  - References: `parlomo-front/redux/features/globalSlice.js`

## user

- **GET** /api/user
  - References: `parlomo-front/redux/features/usersSlice.js`
- **GET** /api/user/admin
  - References: `parlomo-front/redux/features/globalSlice.js`, `parlomo-front/redux/features/usersSlice.js`
- **GET** /api/user/admin/autocomplete?username=${user}
  - References: `parlomo-front/redux/features/directorySlice.js`
- **POST** /api/user/admin/profile/${user.id}
  - References: `parlomo-front/redux/features/usersSlice.js`
- **POST** /api/user/change-password
  - References: `parlomo-front/redux/features/usersSlice.js`
- **POST** /api/user/doVerify
  - References: `parlomo-front/redux/features/authSlice.js`
- **GET** /api/user/front-user?publicId=@${id}
  - References: `parlomo-front/redux/features/globalSlice.js`
- **POST** /api/user/get-user-public
  - References: `parlomo-front/redux/features/chatSlice.js`
- **GET** /api/user/logout
  - References: `parlomo-front/redux/features/usersSlice.js`
- **GET** /api/user/newVerifyCode
  - References: `parlomo-front/redux/features/authSlice.js`
- **POST** /api/user/profile
  - References: `parlomo-front/redux/features/usersSlice.js`
- **POST** /api/user/publicIdAutocomplete
  - References: `parlomo-front/redux/features/chatSlice.js`
- **POST** /api/user/user-permission/${data.id}
  - References: `parlomo-front/redux/features/usersSlice.js`
- **GET** /api/user/user-permission/${id}
  - References: `parlomo-front/redux/features/usersSlice.js`
- **GET** /api/user/userHasPublicId
  - References: `parlomo-front/redux/features/chatSlice.js`
- **POST** /api/user/validatePublicId
  - References: `parlomo-front/redux/features/usersSlice.js`

## verify-payment

- **POST** /api/verify-payment
  - References: `parlomo-front/redux/features/globalSlice.js`

## verify-payment-paypal

- **POST** /api/verify-payment-paypal
  - References: `parlomo-front/redux/features/globalSlice.js`

## video

- **GET** /api/video
  - References: `parlomo-front/redux/features/globalSlice.js`
