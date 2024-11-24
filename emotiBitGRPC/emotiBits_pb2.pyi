from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Device(_message.Message):
    __slots__ = ("serial", "ip")
    SERIAL_FIELD_NUMBER: _ClassVar[int]
    IP_FIELD_NUMBER: _ClassVar[int]
    serial: str
    ip: str
    def __init__(self, serial: _Optional[str] = ..., ip: _Optional[str] = ...) -> None: ...

class DeviceRequest(_message.Message):
    __slots__ = ("sessionName",)
    SESSIONNAME_FIELD_NUMBER: _ClassVar[int]
    sessionName: str
    def __init__(self, sessionName: _Optional[str] = ...) -> None: ...

class DeviceList(_message.Message):
    __slots__ = ("allDevices",)
    ALLDEVICES_FIELD_NUMBER: _ClassVar[int]
    allDevices: _containers.RepeatedCompositeFieldContainer[Device]
    def __init__(self, allDevices: _Optional[_Iterable[_Union[Device, _Mapping]]] = ...) -> None: ...
