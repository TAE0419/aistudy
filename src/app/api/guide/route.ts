import OpenAI from 'openai'
import {NextResponse} from 'next/server'
import {readFile} from 'fs/promises'
import path from 'path'

const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
})

const searchGuide = (question:string, guideText:string)=>{
    const normalize = (text:string)=>{
        return text.toLocaleLowerCase().replace(/\s+/g,'')
    }
    const useQuestion = normalize(question)

    //텍스트 파일을 단원별로 나누기
    const sections = guideText.split(/(?=\[\d{2}\.\s)/)

    //공통 규칙 가져오기
    const commonRule = sections.find(
        item =>item.includes('[00. 챗봇 공통 답변 원칙]')
    )

    const results:{
        text:string
        score:number
    }[]=[]
    for(const item of sections){
        if(item.includes('[00. 챗봇 공통 답변 원칙]')){
            continue
        }
        const title = item.match(/대표\s*명칭:[ \t]*(.+)/)
        const keywords = item.match(/관련\s*표현:[ \t]*(.+)/)
        const questions = [...item.matchAll(/^Q\.[ \t]*(.+)/gm)].map(match=>match[1])

        const words = [title?.[1], ...(keywords?.[1].split(',')||[]), ...questions].filter((word): word is string => Boolean(word))
        //words[0]::홈페이지 소개, words[1]::AI퀴즈, words[1]::ai퀴즈

        let score = 0
        for(const item of words){
            const keyword = normalize(item)
            if(!keyword) continue
            if(useQuestion.includes(keyword)){
                score += keyword.length
            }
        }
        if(score>0){
            results.push({
                text:item,
                score
            })
        }
    }
    /*
    const results = [
    {text:'ai 퀴즈',}
    ]
    */
    results.sort((a,b)=>b.score-a.score)

    //가장 관련성이 높은 단원 최대 3개 선택
    const selected = results.slice(0,3).map(item=>item.text).join('\n\n')

    // 키워드가 일치하지 않아도 자료에 답이 있는지 AI가 확인하도록 한다.
    return selected ? [commonRule, selected].filter(Boolean).join('\n\n') : guideText.trim()
} 



export const POST = async(req:Request)=>{
    try{
        const {question}=await req.json()
        if(typeof question!=='string'||!question.trim()){
            return NextResponse.json(
                {error:'질문을 입력해주세요'},
                {status:400}
            )
        }
        const filePath = path.join(
            process.cwd(), //프로젝트 최상위 폴더의 경로를 가지고 온다
            'public',
            'data',
            'next_step4_guide_rag_complete.txt'
        )
        const guideText = await readFile(
            filePath,
            'utf-8'
        )
        const searchResult = searchGuide(question,guideText)

        if(!searchResult.trim()){
            return NextResponse.json({
                answer:'죄송합니다. 해당 내용은 찾지 못했습니다. React 학습, AI 퀴즈, 힌트, 로그인, 채팅 등 홈페이지 이용 방법을 질문해주세요.'
            })
        }
        const response = await openai.responses.create({
                model:'gpt-4.1-mini',
                instructions:`당신은 react학습 홈페이지의 안내 챗봇입니다.
                아래 검색된 홈페이지 안내 자료만 참고하여 사용자 질문에 답변하세요.
                답변 규칙
                1. 자료에 없는 기능은 만들어내지 마세요
                2. 대소문자와 띄어쓰기 차이를 무시하세요
                3. 퀴즈와 문제처럼 비슷한 표현을 이해하세요
                4. 짧고 친절한 한국어로 대답하세요
                5. 사용자가 이용 방법을 질문하면 순서대로 쉽게 설명하세요

                [검색된 홈페이지 안내자료]
                ${searchResult}`,
                input: question
        })
        return NextResponse.json({
            answer:response.output_text
        })
    }catch(err){
        console.error('챗봇오류:',err)
        return NextResponse.json(
            {error:'ai 답변에 실패했습니다.'},
            {status:500}
        )
    }
}
