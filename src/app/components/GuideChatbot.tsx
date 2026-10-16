'use client'

import {useEffect, useRef, useState} from 'react'
import {ArrowUp, LoaderCircle, MessageCircle, X} from 'lucide-react'
import styles from './GuideChatbot.module.scss'

type ChatMessage = {
    role:'user'|'assistant'
    content:string
}

const GuideChatbot = () => {
    const [open, setOpen] = useState(false)
    const [message,setMessage]=useState<ChatMessage[]>([
        {
            role:'assistant',
            content:'안녕하세요. 페이지 사용 방법을 안내해드리겠습니다.'
        }
    ])
    const [loading,setLoading]= useState(false)
    const [question,setQuestion] = useState('')
    const messageRef = useRef<HTMLDivElement|null>(null)

    useEffect(()=>{
         if(messageRef.current){
            messageRef.current.scrollTop= messageRef.current.scrollHeight
         }
    },[message,loading,open])

    const handleSend=async()=>{
        if(loading || !question.trim()) return

        const userMessage:ChatMessage={
            role:'user',
            content:question.trim()
        }
        setMessage(p=>[...p,userMessage])
        setLoading(true)

        try{
            const response = await fetch('/api/guide',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    question:userMessage.content
                })
            })
            const data = await response.json()
            if(!response.ok){
                throw new Error(data.error || '답변 요청 실패')
            }
            const botMessage:ChatMessage = {
                role:'assistant',
                content:data.answer||'답변을 생성하지 못했습니다.'
            }
            setMessage(p=>[...p,botMessage])
            setQuestion('')
        }catch(err){
            console.error('가이드 챗봇 오류',err)
            setMessage(p=>[...p,{role:'assistant',content:'오류가 발생했습니다. 다시 질문해주세요.'}])
        }finally{
            setLoading(false)
        }
    }

  return (
    <aside className={styles.chatbot} aria-label='페이지 가이드 챗봇'>
      {
        open && (
            <section className={styles.window} id='guide-chatbot' aria-labelledby='guide-chatbot-title'>
                <header className={styles.header}>
                    <div className={styles.heading}>
                        <MessageCircle size={22} aria-hidden='true' />
                        <h3 id='guide-chatbot-title'>페이지 가이드</h3>
                    </div>
                    <button type='button' className={styles.closeButton} onClick={()=>setOpen(false)} aria-label='챗봇 닫기' title='챗봇 닫기'>
                        <X size={20} aria-hidden='true' />
                    </button>
                </header>
                <div className={styles.messages} ref={messageRef} role='log' aria-live='polite' aria-label='대화 내용'>
                    {
                        message.map((item,index)=>(
                            <p key={index} className={item.role==='user'?styles.userMessage:styles.assistantMessage}>
                                {item.content}
                            </p>
                        ))
                    }
                    {loading && <p className={styles.loading} role='status'><LoaderCircle size={16} aria-hidden='true' />답변 작성 중</p>}
                </div>
                    <form className={styles.composer} onSubmit={(e)=>{e.preventDefault(); handleSend()}}>
                        <input
                            type='text'
                            aria-label='챗봇 질문'
                            placeholder='궁금한 내용을 입력하세요'
                            value={question}
                            onChange={(e)=>setQuestion(e.target.value)}
                            onKeyDown={(e)=>{if(e.key === 'Enter' && e.nativeEvent.isComposing) e.preventDefault()}}
                            disabled={loading}
                        />
                        <button type='submit' className={styles.sendButton} disabled={loading || !question.trim()} aria-label='질문 전송' title='질문 전송'>
                            <ArrowUp size={22} aria-hidden='true' />
                        </button>
                    </form>
            </section>
        )
      }
      <button type='button' className={styles.toggleButton} onClick={()=> setOpen(!open)} aria-expanded={open} aria-controls={open?'guide-chatbot':undefined} aria-label={open?'챗봇 닫기':'챗봇 열기'} title={open?'챗봇 닫기':'챗봇 열기'}>
       {open?<X size={26} aria-hidden='true' />:<MessageCircle size={26} aria-hidden='true' />}
      </button>
    </aside>
  )
}

export default GuideChatbot
