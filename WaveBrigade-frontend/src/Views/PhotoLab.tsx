import { PiShootingStarThin } from "react-icons/pi";
import SideComponent from "../components/Components/SideComponent";
import React, { useState } from "react";
import PhotoInput from "@/components/Components/PhotoInput.js";
import ModalComponent from "../components/Components/ModalComponent.js";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

export default function PhotoLab() {
  function handleSubmit() {
    //ADD TOASTS AND MODAL CONFIRMATION
  }
  const [experimentTitle, setExperimentTitle] = useState("");
  const [experimentDesc, setExperimentDesc] = useState("");
  const [caption, setCaption] = useState();
  const [isFileSelected, setIsFileSelected] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageSource, setImageSource] = useState<string | null> (null);
  const location = useLocation();
  const { nickName, roomCode } = location.state || {};
  const navigateTo = useNavigate();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleAction = () => {
    console.log("Creating lobby...");
    navigateTo("/waiting-room", {state: {nickName, roomCode}});
    handleCloseModal();
  };
  function handleChange(e) {
    console.log(e.target.files);
    setFile(URL.createObjectURL(e.target.files[0]));
  }

  return (
    <div className="flex h-screen">
      <div className="flex flex-col max-sm:hidden items-center justify-center w-2/5">
        <SideComponent
          icon={<PiShootingStarThin style={{ fontSize: "200px" }} />}
          headingTitle="Create a Photo Lab"
          description="Start creating your experiment with pictures. Choose a title, write a description, and select a photo to get started"
        />
      </div>
      <div className="flex flex-col items-center justify-center w-2/5">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-6">
            <label
              htmlFor="experimentTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter Title for Experiment{" "}
              <span className="text-purple-500">*</span>
            </label>
            <input
              type="text"
              id="experimentTitle"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              //   focus:outline-none focus:ring-2 focus:ring-indigo-500
              onChange={(e) => setExperimentTitle(e.target.value)}
              value={experimentTitle}
              placeholder="Provide a title for your experiment"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="experimentDesc"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter Description for Experiment{" "}
            </label>
            <textarea
              id="experimentDesc"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              //   focus:outline-none focus:ring-2 focus:ring-indigo-500
              onChange={(e) => setExperimentDesc(e.target.value)}
              value={experimentDesc}
              placeholder="Provide a description for your experiment"
            ></textarea>
          </div>
          <div className="mb-6">
            <label
              htmlFor="addImage"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Add Image
              <span className="text-purple-500"> *</span>
            </label>

          <PhotoInput
            width={500}
            height={250}
            onFileSelected={setIsFileSelected}
            onSourceChange = { setImageSource}
          />
          </div>

          <div className="mb-6">
            <label
              htmlFor="caption"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter a Caption
              <span className="text-purple-500"> *</span>
            </label>
            <input
              type="text"
              id="caption"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              //   focus:outline-none focus:ring-2 focus:ring-indigo-500
              onChange={(e) => setCaption(e.target.value)}
              value={caption}
            />
          </div>
          <div className="flex gap-10 items-center justify-center">
            <button
              type="button"
              onClick={handleOpenModal}
              disabled={!experimentTitle.trim() || !isFileSelected}
              className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                experimentTitle.trim() && isFileSelected
                  ? "bg-[#7F56D9] hover:bg-violet-500 text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              Confirm
            </button>
            {/*This will redirect to Media Page */}
          </div>
        </form>
      </div>
      <ModalComponent
            onAction={handleAction}
            isOpen={isModalOpen}
            onCancel={handleCloseModal}
            modalTitle='LAB CONFIRMATION'
            >
              <div className="mb-6">
                  <label
                    htmlFor="experimentTitle"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Title of Experiment
                  </label>
                  <input
                    type="text"
                    id="experimentTitle"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled
                    value={experimentTitle}
                    onChange={(e) => setExperimentTitle(e.target.value)}
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="experimentDesc"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description of Experiment{" "}
                  </label>
                  <textarea
                    id="experimentDesc"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    //   focus:outline-none focus:ring-2 focus:ring-indigo-500
                    onChange={(e) => setExperimentDesc(e.target.value)}
                    value={experimentDesc}
                    disabled
                  ></textarea>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="experimentImage"
                    className="block text-md font-medium text-gray-700 mb-2"
                  >
                    File Upload
                  </label>
                  <input
                    type="text"
                    id="experimentImage"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled
                    value={imageSource}
                    onChange={(e) => setImageSource(e.target.value)}
                  />
                 
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="caption"
                    className="block text-md font-medium text-gray-700 mb-2"
                  >
                    Caption
                  </label>
                  <input
                    type="text"
                    id="caption"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                 
                </div>
              </ModalComponent>
    </div>
  );
}
