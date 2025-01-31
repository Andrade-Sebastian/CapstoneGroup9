import { useNavigate } from "react-router-dom";
import react from 'react' //path?
// import ImageCardComponent from "../components/Components/ImageCardComponent";
// import Carousel from "../components/Components/CarouselComponent";


export default function PreviouslyMadeExperiments() {
  const navigateTo = useNavigate();

  return (
    <>
      <div className="flex flex-col justify-center items-center min-h-screen h-auto p-4 place-content-center ">
        <div className="bg-white rounded-xl p-8 shadow-lg w-4/5 min-h-[1203px] flex flex-col place-content-center space-y-8">
            <h1 className="text-3xl font-semibold text-center mb-4 text-gray-800">
              View previously made experiments
            </h1>
    
         
            <div>
              <div>
                <p>TEST</p> 
              </div>
            </div>
            
          <p className="text-center"> or...</p>
          <div className="flex justify-center">
            <button
              type="submit"
              className="mt-6 bg-[#7F56D9] hover:bg-violet-500 text-white font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out"
              onClick={() =>
                navigateTo("/create-lab/select-lab", {
                  state: { userName: "defaultUser" },
                })
              }
            >
              Create Experiment
            </button>
          </div>
        </div>
      </div>
    </>
  );
}



 {/* <Carousel> */}
{/* <ImageCardComponent
              headingTitle="Video Lab #3"
              description="A sexy Mike Tyson with his cheeks out lab to monitor
                  temperature and arousal."
              source="https://i.dailymail.co.uk/1s/2024/11/16/04/92135043-0-image-a-1_1731729974205.jpg"
              alt="Mike"
              </ImageCardComponent> */}
          {/* </Carousel> */}
          
          {/* <ImageCardComponent
            headingTitle="Picture Lab #1"
            description="A picture of a cute owl."
            source="https://lh3.googleusercontent.com/proxy/YngsuS8jQJysXxeucAgVBcSgIdwZlSQ-HvsNxGjHS0SrUKXI161bNKh6SOcMsNUGsnxoOrS3AYX--MT4T3S3SoCgSD1xKrtBwwItcgexaX_7W-qHo-VupmYgjjzWO-BuORLp9-pj8Kjr"
            alt="Mike"
            />
            <ImageCardComponent
            headingTitle="Gallery Lab #1"
            description="Gallery of Obama"
            source="https://obamawhitehouse.archives.gov/sites/whitehouse.gov/files/images/POTUS_header2.jpg"
            alt="Mike"
            /> */}
