import { motion } from 'framer-motion'

interface NewsCardProps {
  news: {
    id: string
    title: string
    content: string
    author: string
    publishedDate: string
  }
}

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <motion.div
      className="bg-white p-4 rounded-lg shadow-md mb-4"
      whileHover={{ scale: 1.02 }}
    >
      <h3 className="text-lg font-semibold">{news.title}</h3>
      <p className="text-gray-700 mt-2">{news.content.substring(0, 100)}...</p>
      <p className="text-sm text-gray-500 mt-2">By {news.author} on {news.publishedDate}</p>
    </motion.div>
  )
}