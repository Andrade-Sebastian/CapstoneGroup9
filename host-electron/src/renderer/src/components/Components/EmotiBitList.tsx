import { Card, CardHeader, CardBody, CardFooter, Divider } from '@heroui/react'
import { IUser } from '@renderer/hooks/useSessionState'
import { ReactElement } from 'react'
import { CiSettings } from 'react-icons/ci'

interface IEmotiBitList {
  user: IUser
  isConnected: boolean
  onClick?: () => void
}

export default function EmotiBitList(props: IEmotiBitList) {
  const shownIcon = props.isConnected ? <p>ok</p> : <p>not connected</p>
  return (
    <Card onPress={props.onClick} className="border shadow-lg rounded-lg max-w-[400px] bg-white">
      <CardHeader className="flex items-center justify-between p-4 ">
        <div className="flex items-center gap-2">
          <div className="text-lg text-green-500"> {shownIcon} </div>

          <div>
            <h1 className="text-lg font-medium text-gray-700"> Joiner: {props.user.nickname} </h1>
            <h1 className="text-lg font-medium text-black"> Serial: NJ3KDU2NEAKI2NFA2IFA</h1>
            <h1 className="text-lg font-medium text-black"> IP:123.456.78.9</h1>
          </div>
        </div>
        <span>
          <CiSettings className="text-gray-600 text-xl cursor-pointer hover:text-black size-10" />
        </span>
      </CardHeader>
    </Card>
  )
}
