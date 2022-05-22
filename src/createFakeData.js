import Post from './models/post'

export default function createFakeData(){
  const posts = [...Array(40).keys()].map(i => ({
    title: `포스트 #${i}`,
    body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",
    tags: ['가짜', '데이터']
  }))

  Post.insertMany(posts, (err, docs) => {
    console.log(docs)
  })
}