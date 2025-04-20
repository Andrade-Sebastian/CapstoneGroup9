import { Card, CardHeader, CardBody, CardFooter, Divider } from '@heroui/react'
import { IUser } from '@renderer/hooks/useSessionState'
import { ReactElement } from 'react'
import { CiSettings, CiCircleCheck, CiCircleQuestion } from 'react-icons/ci'

interface IEmotiBitList {
  user: IUser;
  onClick?: () => void;
  onAction: () => void;
}

export default function EmotiBitList(props: IEmotiBitList) {
  const shownIcon = props.user.associatedDevice?.isConnected ? (<CiCircleCheck className='text-green-500 ' size={35}/>) :( <CiCircleQuestion className='text-gray-500 text-xl' size={35}/>)
  return (
    <Card onPress={props.onClick} className="border shadow-lg rounded-lg max-w-[400px] bg-white">
      <CardHeader className="flex items-center justify-between p-4 ">
        <div className="flex items-center gap-2">
        {shownIcon}
          <div>
            <h1 className="text-lg font-medium text-gray-700"> Joiner: {props.user.nickname} </h1>
            <h1 className="text-lg font-medium text-black"> Serial: {props.user.associatedDevice?.serialNumber || 'N/A'}</h1>
            <h1 className="text-lg font-medium text-black"> IP: {props.user.associatedDevice?.ipAddress || 'NA'}</h1>
          </div>
        </div>
        <button type='button' className='py-3 px-6 transition duration-300 ease-in-out' onClick={props.onAction}>
          <CiSettings className="text-gray-600 text-xl cursor-pointer hover:text-black size-10" />
        </button>
      </CardHeader>
    </Card>
  )
}


