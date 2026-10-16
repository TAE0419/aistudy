import {StudyItem} from '@/types/study'

type Pro={
    item:StudyItem
}

const StudyCard = ({item}:Pro) => {
  return (
    <article>
        <span>{item.id}</span>
        <h3>{item.title}</h3>
        <p></p>
    </article>
  )
}

export default StudyCard
