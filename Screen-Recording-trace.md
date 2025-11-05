UserAuth.login { username: 'bgrey', password: 'testpassword' } => { token: '019a5603-6556-7046-8db7-5cd2b93cd91c' }

[Requesting] Received request for path: /Following/_getFollowedItems

Requesting.request {
  token: '019a5603-6556-7046-8db7-5cd2b93cd91c',
  user: '019a03f2-bfa7-7fb2-9b60-765eda403634',
  path: '/Following/_getFollowedItems'
} => { request: '019a5603-671e-7fd9-a374-d70b6ef8eda7' }

Requesting.respond {
  request: '019a5603-671e-7fd9-a374-d70b6ef8eda7',
  results: [ { item: '019a55fc-84da-74f4-93ce-348aa58afa2e' } ]
} => { request: '019a5603-671e-7fd9-a374-d70b6ef8eda7' }

[Requesting] Received request for path: /Following/_getFollowedItems

Requesting.request {
  token: '019a5603-6556-7046-8db7-5cd2b93cd91c',
  user: '019a03f2-bfa7-7fb2-9b60-765eda403634',
  path: '/Following/_getFollowedItems'
} => { request: '019a5603-ed23-7f9a-9907-c80d2dd4671c' }

Requesting.respond {
  request: '019a5603-ed23-7f9a-9907-c80d2dd4671c',
  results: [ { item: '019a55fc-84da-74f4-93ce-348aa58afa2e' } ]
} => { request: '019a5603-ed23-7f9a-9907-c80d2dd4671c' }

[Requesting] Received request for path: /Following/_getFollowedItems

Requesting.request {
  token: '019a5603-6556-7046-8db7-5cd2b93cd91c',
  user: '019a03f2-bfa7-7fb2-9b60-765eda403634',
  path: '/Following/_getFollowedItems'
} => { request: '019a5604-8163-7a75-bc07-af7241d202ef' }

Requesting.respond {
  request: '019a5604-8163-7a75-bc07-af7241d202ef',
  results: [ { item: '019a55fc-84da-74f4-93ce-348aa58afa2e' } ]
} => { request: '019a5604-8163-7a75-bc07-af7241d202ef' }

[Requesting] Received request for path: /Following/unfollow

Requesting.request {
  token: '019a5603-6556-7046-8db7-5cd2b93cd91c',
  user: '019a03f2-bfa7-7fb2-9b60-765eda403634',
  item: '019a55fc-84da-74f4-93ce-348aa58afa2e',
  path: '/Following/unfollow'
} => { request: '019a5604-bb81-71ec-908e-dddb16474e66' }


Following.unfollow {
  user: '019a03f2-bfa7-7fb2-9b60-765eda403634',
  item: '019a55fc-84da-74f4-93ce-348aa58afa2e'
} => {}


Requesting.respond { request: '019a5604-bb81-71ec-908e-dddb16474e66' } => { request: '019a5604-bb81-71ec-908e-dddb16474e66' }

[Requesting] Received request for path: /Following/follow

Requesting.request {
  token: '019a5603-6556-7046-8db7-5cd2b93cd91c',
  user: '019a03f2-bfa7-7fb2-9b60-765eda403634',
  item: '019a55fc-84da-74f4-93ce-348aa58afa2e',
  path: '/Following/follow'
} => { request: '019a5604-c30b-7521-b2b6-b3efadaf85e3' }


Following.follow {
  user: '019a03f2-bfa7-7fb2-9b60-765eda403634',
  item: '019a55fc-84da-74f4-93ce-348aa58afa2e'
} => {}


Requesting.respond { request: '019a5604-c30b-7521-b2b6-b3efadaf85e3' } => { request: '019a5604-c30b-7521-b2b6-b3efadaf85e3' }

[Requesting] Received request for path: /Following/_getFollowedItems

Requesting.request {
  token: '019a5603-6556-7046-8db7-5cd2b93cd91c',
  user: '019a03f2-bfa7-7fb2-9b60-765eda403634',
  path: '/Following/_getFollowedItems'
} => { request: '019a5604-d510-78b3-8e55-4d2b47b05531' }

Requesting.respond {
  request: '019a5604-d510-78b3-8e55-4d2b47b05531',
  results: [ { item: '019a55fc-84da-74f4-93ce-348aa58afa2e' } ]
} => { request: '019a5604-d510-78b3-8e55-4d2b47b05531' }