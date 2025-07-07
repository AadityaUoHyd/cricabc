import Pusher from 'pusher-js'

export const initPusher = () => {
  const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  })
  return pusher
}