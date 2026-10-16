export type Studymode = 'explain'|'quiz'|'hint'

export type StudyItem = {
    id: number
    title: string
    description:string
    mode: Studymode
}

export type AiRequest = {
    message : string
    mode:Studymode
    currentQuiz?: string
}
export type AiResponse={
    answer:string
    quizAnswer?:string
}
