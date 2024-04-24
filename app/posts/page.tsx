'use client'
import { useDispatch, useSelector } from "react-redux";
import { PostState, Post } from "@/typing";
import { useEffect, useState } from "react";
import { fetchAsyncPosts, getPostById } from "@/features/dataSlice";
import Grid from "@/components/Grid";
import { AppDispatch, RootState } from "../store";
import LoadingCard from "@/components/LoadingCard";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import useDrivePicker from "react-google-drive-picker";
import { PickerCallback } from "react-google-drive-picker/dist/typeDefs";


export default function Posts() {

  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const { posts, loading, error } = useSelector((state: RootState) => state.data);
  const { user, loading: userLoading, error: userError } = useSelector((state: RootState) => state.user);
  const [data, setData] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [driveQuery, setDriveQuery] = useState("");
  const [isImagePrivate, setIsImagePrivate] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileData, setFileData] = useState<PickerCallback>();

  useEffect(() => {
    // Only load posts if required
    if (posts.length === 0 || !posts) {
      dispatch(fetchAsyncPosts());
    }
  }, [dispatch])
  useEffect(() => {
    setData(posts);
  }, [posts])

  // useEffect(() => {
  //   if (!user.uid) {
  //     // Not permitted to view posts, if not logged in
  //     toast.warn("Login Needed !", {
  //       position: toast.POSITION.BOTTOM_LEFT,
  //     });
  //     router.push('/login');
  //   }
  // }, [dispatch, user]);



  // Handlesearch will not modify posts, it will use data state (temporary)
  const handleSearch = (query: string) => {
    let filtered = posts;
    if (query) {
      filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.body.toLowerCase().includes(query.toLowerCase())
      );
    }
    setData(filtered);
  };

  // Update data state whenever searchQuery updates
  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery])



  // Function to extract file ID from Google Drive link
  function extractFileId(driveQuery: string) {
    const regexPattern = /\/file\/d\/([a-zA-Z0-9_-]+)\//;
    const match = driveQuery.match(regexPattern);
    // console.log(match, match[1])
    return match ? match[1] : null;
  }

  useEffect(() => {
    const previwUrl2 = "https://drive.google.com/file/d/" + extractFileId(driveQuery) + "/preview";
    setPreviewUrl(previwUrl2);
  }, [driveQuery])

  // const customViewsArray = [new google.picker.DocsView()]; // custom view
  const [openPicker, authResponse] = useDrivePicker();
  const handleOpenPicker = () => {
    openPicker({
      clientId: "486242583673-oleivvm7k90iuk1fe1949pbem07ug1b8.apps.googleusercontent.com",
      developerKey: "AIzaSyC5ryyBzFLYlJNnXAF9b_QelP5855FJ-UE",
      viewId: "DOCS",
      // token: token, // pass oauth token in case you already have one
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      // customViews: customViewsArray, // custom view
      callbackFunction: async (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button')
        } else {
          new Promise((resolve) => setTimeout(resolve, 750));

          if (data) {
            useFiledataPrint(data);
            console.log(data)
            setFileData(data);
            setPreviewUrl(data.docs[0].embedUrl)
          }

          // console.log("URL to store", data.docs[0].url);
          // console.log("embedURL", data.docs[0].embedUrl)
          // console.log("mimeType", data.docs[0].mimeType)
          // console.log("sizeBytes", data.docs[0].sizeBytes/1024)

          // setPreviewUrl(data.docs[0].embedUrl)
        }


      },
    })
  }

  const useFiledataPrint = (data: PickerCallback) => {
    console.log("printer, ", data.docs);
  }


  // const fetchAndSetDriveLink = async (strLink: string) => {
  //   setDriveQuery(strLink);
  //   const fileId = extractFileId(strLink);
  //   if (!fileId) {
  //     return true; // Invalid link
  //   }

  //   // Make a request to Google Drive API to get file metadata
  //   if(localStorage.getItem("idToken")){
  //     const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=permissions`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem("idToken")}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     console.log(response);

  //     if (response.ok) {

  //       const previwUrl2 = "https://drive.google.com/file/d/" + extractFileId(driveQuery) + "/preview";
  //       setPreviewUrl(previwUrl2);
  //       const data = await response.json();
  //       // Check if the file has any permissions set
  //       return !data.permissions || data.permissions.length === 0;
  //     } else {
  //       setIsImagePrivate(true);
  //       // Handle error
  //       console.error('Failed to fetch file metadata:', response.status);
  //       return true; // Assume private on error
  //     }
  //   }

  //   const previwUrl2 = "https://drive.google.com/file/d/" + extractFileId(driveQuery) + "/preview";
  //   setPreviewUrl(previwUrl2);

  // }

  // if (error) {
  //   toast.error(error, {
  //     position: toast.POSITION.BOTTOM_LEFT,
  //   });
  //   return <div className="text-center mx-auto my-10 text-xl "><b>{error}</b></div>;
  // }

  // Loading State for posts
  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex m-4 p-4 search" id="search">
          <input
            className="text-base text-black w-full shadow-md bg-light_bg_skin dark:bg-dark_bg_skin p-2 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="ml-3 bg-light_bg_button dark:bg-dark_bg_button p-2 rounded-lg shadow-sm">
            Search
          </button>
        </div>

        <div className="mt-12 max-w-3xl mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
          {[1, 2, 3]?.map((dummypost) => (
            <LoadingCard key={dummypost} />
          ))}
        </div>
      </div>
    );
  }



  return (
    <div>
      <div>
        <div className="flex m-4 p-4 text-black dark:text-white">
          <input
            className="text-base text-black w-full shadow-md bg-red-50 p-2 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => handleSearch(searchQuery)}
            className="ml-3 bg-light_bg_button dark:bg-dark_bg_button p-2 rounded-lg shadow-sm"
          >
            Search
          </button>
        </div>
        <div className="flex m-4 p-4 search" id="search">
          <input
            className="text-base text-black w-full shadow-md bg-red-50 p-2 rounded-lg"
            value={driveQuery}
            onChange={(e) => setDriveQuery(e.target.value)}
          />
          <button onClick={() => handleOpenPicker()} className="ml-3 bg-light_bg_button dark:bg-dark_bg_button p-2 rounded-lg shadow-sm">
            Drive
          </button>
        </div>

        {/* {isImagePrivate && <>Image is Private</>} */}
        {(previewUrl && fileData && fileData?.docs && fileData?.docs[0]) && <>
          URL: {fileData?.docs[0]?.url} <br />
          Preview: {fileData?.docs[0]?.embedUrl} <br />
          Mime: {fileData?.docs[0]?.mimeType} <br />
          isShared: {fileData?.docs[0]?.isShared} <br />
          size: {fileData?.docs[0]?.sizeBytes && (fileData?.docs[0]?.sizeBytes) / 1024} <br />

          <iframe
            title="imagesgdrive"
            className=""
            src={previewUrl}
            height={400}
            width={600}
          />
        </>
        }

        {(previewUrl) && <>

          <iframe
            title="imagesgdrive"
            className=""
            src={previewUrl}
            height={400}
            width={600}
          />
        </>
        }
      </div>
      <Grid posts={data} />
    </div>
  );
}
