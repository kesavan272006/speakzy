let mediaStream
let recorder
let chunks=[]
export async function startRecording(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia) return null
  mediaStream=await navigator.mediaDevices.getUserMedia({audio:true})
  recorder=new MediaRecorder(mediaStream,{mimeType:'audio/webm'})
  chunks=[]
  return new Promise(res=>{
    recorder.ondataavailable=e=>{if(e.data&&e.data.size>0)chunks.push(e.data)}
    recorder.onstop=()=>{const blob=new Blob(chunks,{type:'audio/webm'});res(blob)}
    recorder.start()
  })
}
export function stopRecording(){
  if(recorder&&recorder.state!=='inactive')recorder.stop()
  if(mediaStream){mediaStream.getTracks().forEach(t=>t.stop())}
}
