import { create } from 'zustand'

export interface IUserInfo {
  socketid: any;
  device: number,
  deviceId: number,
  deviceSocketId: string,
  frontendSocketId: string,
  ipAddress: string,
  isAvailable: boolean,
  isConnected: boolean,
  isMasked: boolean,
  leftSession: null,
  nickname: string,
  samplingFrequency: number,
  secret: string,
  serialNumber: string,
  sessionId: number,
  userId: number,
  userRole: string
}

interface IDevice {
  deviceId: string;
  serialNumber: string;
  ipAddress: string;
  deviceSocketId: string;
  isConnected: boolean;
}

interface IGallery{
  id: number;
  src:string;
  file: File
  title?: string;
  caption?: string;
  uploadedAt?: Date; 
}
interface SessionState{
    sessionId: string;
    hostName: string;
    users: IUserInfo[];
    roomCode: string;
    experimentId: number;
    experimentTitle: string;
    experimentDesc: string;
    experimentType: number;
    //photo
    photoLabImageSource: string | null;
    //video
    videoLabSource: string | null;
    videoURL: string | null;
    videoID: string | null;
    //article
    articleLabSource: string | null;
    articleURL: string | null;
    //gallery
    galleryPhotos: IGallery[];
    currentGalleryIndex: number | null;
    selectedGalleryImage: IGallery | null;
    
    devices: IDevice[];
    experimentTypeString: string;

    spectators: boolean;
    isActive: boolean;


    setSessionId: (id: string) => void;
    setHostName: (name: string) => void;
    setUsers: (users: IUserInfo[]) => void;
    addUser: (user: IUserInfo) => void;
    removeUser: (userId: number) => void;
    toggleUserMask: (userId: string) => void;
    setRoomCode: (code: string) => void;
    setExperimentId: (id: number) => void;
    setExperimentTitle: (experimentTitle: string) => void;
    setExperimentDesc: (experimentDesc: string) => void;
    setExperimentType: (experimentType: number) => void;
    //setPhoto
    setPhotoLabImageSource: (imageSource: string) => void;
    //setVideo
    setVideoLabSource: (videoSource: string) => void;
    setVideoURL: (videoURL: string) => void;
    setVideoID: (videoID: string) => void;
    //setArticle
    setArticleLabSource: (articleSource: string) => void;
    setArticleURL: (articleURL: string) => void;
    //setGallery
    addPhoto: (photo: IGallery) => void;
    addPhotos: (photos: IGallery[]) => void;
    removePhoto: (id: string) => void;
    clearPhotos: () => void;
    setCurrentGalleryIndex: (index: number) => void;
    setSelectedGalleryImage: (image: IGallery | null) => void;
    reorderPhoto: (fromIndex: number, toIndex: number) => void;
    addDevice: (device: IDevice) => void;
    removeDevice: (deviceId: string)=> void;
    setExperimentTypeString: (experimentTypeString: string) => void;
    setSpectators: (spectators: boolean) => void;
    updateDevice: (updatedDevice: IDevice) => void;
    setIsActive: (isActive: boolean) => void;
}

export const useSessionStore = create<SessionState>()(

        (set) => ({
            sessionId: '',
            hostName: '',
            users: [],
            roomCode: '',
            experimentId: 0,
            experimentTitle: '',
            experimentDesc: '',
            photoLabImageSource: '',
            videoLabSource: '',
            videoURL: '',
            videoID: '',
            articleLabSource: '',
            articleURL: '',
            galleryPhotos: [],
            currentGalleryIndex: null,
            selectedGalleryImage: null,
            devices: [],
            experimentType: 0,
            experimentTypeString: '',
            spectators: false,
            isActive: false,
            

            setSessionId: (id: string): void => set(() => ({ sessionId: id})),
            setHostName: (name: string): void => set(() => ({ hostName: name})),
            addUser: (newUser: IUserInfo): void => set((state) => ({
              users: [...(Array.isArray(state.users) ? state.users : []), newUser],
            })),
            removeUser: (userId: number): void => set((state: SessionState) => ({users: state.users.filter((user: IUserInfo) => user.userId !== userId),})),
            setUsers: (users: IUserInfo[] | undefined): void => set((state) => ({
              users: Array.isArray(users) ? [...users] : [...state.users],
            })),
            toggleUserMask: (userId: string): void => set((state) => ({ users: state.users.map((user) => user.userId === userId ? { ...user, isMasked: !user.isMasked} : user),})),
            setRoomCode: (code: string): void => set(() => ({ roomCode: code})),
            setExperimentId: (id: number): void => set(() => ({experimentId: id})),
            setExperimentTitle: (title: string): void => set(() => ({ experimentTitle: title})),
            setExperimentDesc: (desc: string): void => set(() => ({ experimentDesc: desc})),
            setPhotoLabImageSource: (imageSource: string | null): void => set(() => ({ photoLabImageSource: imageSource })),
            setVideoLabSource: (videoSource: string | null): void => set(() => ({ videoLabSource: videoSource })),
            setVideoURL: (videoURL: string): void => set(() => ({videoURL: videoURL})),
            setVideoID: (videoID: string): void => set(() => ({videoID: videoID})),
            setArticleLabSource: (articleSource: string | null): void => set(() => ({ articleLabSource: articleSource})),
            setArticleURL: (articleURL: string): void =>set(() => ({articleURL: articleURL})), 
            addPhoto: (photo): void => set((state) => ({galleryPhotos: [...state.galleryPhotos, photo]})),
            addPhotos: (photos): void => set((state) => ({galleryPhotos: [...state.galleryPhotos, ...photos]})),
            removePhoto: (id): void => set((state) => ({ galleryPhotos: state.galleryPhotos.filter((p) => p.id !== id)})),
            clearPhotos: (): void => set({ galleryPhotos: [], currentGalleryIndex: null}),
            setCurrentGalleryIndex: (index): void => set({ currentGalleryIndex: index}),
            setSelectedGalleryImage: (image): void => set(() => ({selectedGalleryImage: image})),
            reorderPhoto: (fromIndex, toIndex): void => set((state) => { const photos = [...state.galleryPhotos] 
              if(fromIndex < 0 || toIndex < 0 || fromIndex >= photos.length || toIndex >= photos.length){
                return{}
              }
              const [movedItem] = photos.splice(fromIndex, 1)
              photos.splice(toIndex, 0, movedItem)

              return {galleryPhotos: photos}
            }), 
            addDevice: (device: IDevice): void => set((state) => ({
              devices: [...state.devices, device], 
            })),
            removeDevice: (device: any): void => set((state) => ({devices: state.devices.filter((d) => d.deviceId !== device.deviceId)})),
            updateDevice: (updatedDevice: IDevice) => set((state) => ({
              devices: state.devices.map((device) =>
                device.serialNumber === updatedDevice.serialNumber ? { ...device, ...updatedDevice } : device
              ),
            })),
            setExperimentType: (experimentType: number): void => set(() => ({ experimentType: experimentType})),
            setExperimentTypeString: (experimentTypeString: string): void => set(() => ({experimentTypeString: experimentTypeString})),
            setSpectators: (isAllowed: boolean): void => set(() => ({spectators: isAllowed})),
            setIsActive: (isActive: boolean): void => set(()=>({isActive: isActive}))
        }));