// // import { useState, useCallback, useRef, useEffect } from "react";
// // import { Upload, X, Image as ImageIcon, CheckCircle } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { Card } from "@/components/ui/card";
// // import { useToast } from "@/hooks/use-toast";

// // const BACKEND_URL = "http://localhost:8000/detect/image/yolo"; // adjust if your endpoint is different

// // const ImageUpload = () => {
// //   const [selectedFile, setSelectedFile] = useState<File | null>(null);
// //   const [localPreview, setLocalPreview] = useState<string | null>(null); // preview of uploaded file
// //   const [processedImage, setProcessedImage] = useState<string | null>(null); // image returned from backend
// //   const [isDragging, setIsDragging] = useState(false);
// //   const [isAnalyzing, setIsAnalyzing] = useState(false);
// //   const inputRef = useRef<HTMLInputElement | null>(null);
// //   const { toast } = useToast();

// //   // create local preview from file
// //   const createLocalPreview = (file: File) => {
// //     // revoke previous preview if it was an object URL
// //     if (localPreview && localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview);

// //     const url = URL.createObjectURL(file);
// //     setLocalPreview(url);
// //     setProcessedImage(null); // clear old processed image when new file chosen
// //   };

// //   const handleDrop = useCallback(
// //     (e: React.DragEvent<HTMLDivElement>) => {
// //       e.preventDefault();
// //       setIsDragging(false);

// //       const file = e.dataTransfer.files?.[0];
// //       if (file && file.type.startsWith("image/")) {
// //         setSelectedFile(file);
// //         createLocalPreview(file);
// //         toast({
// //           title: "Image selected",
// //           description: "Ready for analysis",
// //           duration: 2500,
// //         });
// //       } else {
// //         toast({
// //           title: "Unsupported file",
// //           description: "Please drop an image file.",
// //           variant: "destructive",
// //         });
// //       }
// //     },
// //     [toast, localPreview]
// //   );

// //   const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0];
// //     if (file && file.type.startsWith("image/")) {
// //       setSelectedFile(file);
// //       createLocalPreview(file);
// //       toast({
// //         title: "Image selected",
// //         description: "Ready for analysis",
// //         duration: 2500,
// //       });
// //     } else if (file) {
// //       toast({
// //         title: "Unsupported file",
// //         description: "Please choose an image file.",
// //         variant: "destructive",
// //       });
// //     }
// //   };

// //   // send file to backend, expect an image response (blob)
// //   const handleAnalyze = async () => {
// //     if (!selectedFile) {
// //       toast({
// //         title: "No image",
// //         description: "Please upload an image before analyzing.",
// //         variant: "destructive",
// //       });
// //       return;
// //     }

// //     setIsAnalyzing(true);
// //     toast({
// //       title: "Analyzing image...",
// //       description: "AI detection in progress",
// //     });

// //     try {
// //       const fd = new FormData();
// //       fd.append("file", selectedFile);

// //       const res = await fetch(BACKEND_URL, {
// //         method: "POST",
// //         body: fd,
// //       });

// //       if (!res.ok) {
// //         const text = await res.text().catch(() => "");
// //         throw new Error(`Server error: ${res.status} ${text}`);
// //       }

// //       // If backend returns JSON with a base64 string or URL, try parsing that first
// //       const contentType = res.headers.get("content-type") || "";
// //       if (contentType.includes("application/json")) {
// //         const json = await res.json();
// //         // try common shapes: { image: "data:image/png;base64,..." } or {image_base64: "..."}
// //         if (json.image && typeof json.image === "string") {
// //           setProcessedImage(json.image);
// //         } else if (json.image_base64 && typeof json.image_base64 === "string") {
// //           const dataUri = json.image_base64.startsWith("data:")
// //             ? json.image_base64
// //             : `data:image/png;base64,${json.image_base64}`;
// //           setProcessedImage(dataUri);
// //         } else if (json.url && typeof json.url === "string") {
// //           setProcessedImage(json.url);
// //         } else {
// //           throw new Error("Unexpected JSON response shape from server.");
// //         }
// //       } else if (contentType.startsWith("image/") || contentType === "") {
// //         // treat response as image blob
// //         const blob = await res.blob();
// //         // revoke previous processedImage URL if it was object URL
// //         if (processedImage && processedImage.startsWith("blob:")) URL.revokeObjectURL(processedImage);
// //         const objectUrl = URL.createObjectURL(blob);
// //         setProcessedImage(objectUrl);
// //       } else {
// //         // fallback: attempt to read as blob anyway
// //         const blob = await res.blob();
// //         if (blob.size > 0) {
// //           const objectUrl = URL.createObjectURL(blob);
// //           setProcessedImage(objectUrl);
// //         } else {
// //           throw new Error("Empty response from server.");
// //         }
// //       }

// //       toast({
// //         title: "Analysis complete",
// //         description: "Processed image received.",
// //         duration: 2500,
// //       });
// //     } catch (err: any) {
// //       console.error("Analyze error:", err);
// //       toast({
// //         title: "Analysis failed",
// //         description: err?.message || "Something went wrong while analyzing.",
// //         variant: "destructive",
// //       });
// //     } finally {
// //       setIsAnalyzing(false);
// //     }
// //   };

// //   // cleanup object URLs on unmount or when previews/images change
// //   useEffect(() => {
// //     return () => {
// //       if (localPreview && localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview);
// //       if (processedImage && processedImage.startsWith("blob:")) URL.revokeObjectURL(processedImage);
// //     };
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []); // run once on unmount

// //   // helper to clear selection(s)
// //   const clearSelection = () => {
// //     if (localPreview && localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview);
// //     if (processedImage && processedImage.startsWith("blob:")) URL.revokeObjectURL(processedImage);
// //     setLocalPreview(null);
// //     setProcessedImage(null);
// //     setSelectedFile(null);
// //     // reset input value so same file can be selected again
// //     if (inputRef.current) inputRef.current.value = "";
// //   };

// //   // which image to show: prefer processedImage returned from backend
// //   const displayImage = processedImage ?? localPreview;

// //   return (
// //     <Card className="p-6 bg-gradient-to-br from-card to-accent-light/10 border-border shadow-lg">
// //       <div className="flex items-center gap-3 mb-4">
// //         <div className="p-2 bg-primary/10 rounded-lg">
// //           <ImageIcon className="w-5 h-5 text-primary" />
// //         </div>
// //         <h2 className="text-2xl font-semibold text-foreground">Disease Detection</h2>
// //       </div>

// //       <div
// //         onDrop={handleDrop}
// //         onDragOver={(e) => {
// //           e.preventDefault();
// //           setIsDragging(true);
// //         }}
// //         onDragLeave={() => setIsDragging(false)}
// //         className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
// //           isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50"
// //         }`}
// //       >
// //         {!displayImage ? (
// //           <div className="text-center">
// //             <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
// //               <Upload className="w-8 h-8 text-primary" />
// //             </div>
// //             <h3 className="text-lg font-medium text-foreground mb-2">Upload Coffee Leaf Image</h3>
// //             <p className="text-muted-foreground mb-4">Drag and drop or click to select an image</p>

// //             <input
// //               ref={inputRef}
// //               type="file"
// //               accept="image/*"
// //               onChange={handleFileInput}
// //               className="hidden"
// //               id="file-upload"
// //             />
// //             <label htmlFor="file-upload">
// //               <Button variant="default" className="cursor-pointer" asChild>
// //                 <span>Select Image</span>
// //               </Button>
// //             </label>
// //           </div>
// //         ) : (
// //           <div className="space-y-4">
// //             <div className="relative rounded-lg overflow-hidden">
// //               <img
// //                 src={displayImage}
// //                 alt={processedImage ? "Processed result" : "Uploaded leaf"}
// //                 className="w-full h-auto max-h-96 object-contain bg-muted"
// //               />
// //               <button
// //                 onClick={clearSelection}
// //                 className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
// //                 title="Remove image"
// //               >
// //                 <X className="w-4 h-4" />
// //               </button>
// //             </div>

// //             <div className="flex gap-2">
// //               <Button onClick={handleAnalyze} className="flex-1" size="lg" disabled={!selectedFile || isAnalyzing}>
// //                 <CheckCircle className="mr-2 w-5 h-5" />
// //                 {isAnalyzing ? "Analyzing..." : processedImage ? "Re-analyze" : "Analyze Disease"}
// //               </Button>

// //               <label htmlFor="file-upload">
// //                 <Button variant="ghost" disabled={isAnalyzing}>
// //                   Change
// //                 </Button>
// //               </label>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </Card>
// //   );
// // };

// // export default ImageUpload;
// import { useState, useCallback, useRef, useEffect } from "react";
// import { Upload, X, Image as ImageIcon, CheckCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast";

// const BACKEND_URL = "http://localhost:8000/detect/image/yolo"; // keep as-is or change to your deployed endpoint

// const ImageUpload = () => {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [localPreview, setLocalPreview] = useState<string | null>(null);
//   const [processedImage, setProcessedImage] = useState<string | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const { toast } = useToast();

//   // create local preview from file
//   const createLocalPreview = (file: File) => {
//     // revoke previous preview if it was an object URL
//     if (localPreview && localPreview.startsWith("blob:")) {
//       URL.revokeObjectURL(localPreview);
//     }

//     const url = URL.createObjectURL(file);
//     setLocalPreview(url);
//     setProcessedImage(null);
//   };

//   const handleDrop = useCallback(
//     (e: React.DragEvent<HTMLDivElement>) => {
//       e.preventDefault();
//       setIsDragging(false);

//       const file = e.dataTransfer.files?.[0];
//       if (file && file.type.startsWith("image/")) {
//         setSelectedFile(file);
//         createLocalPreview(file);
//         toast({
//           title: "Image selected",
//           description: "Ready for analysis",
//           duration: 2500,
//         });
//       } else {
//         toast({
//           title: "Unsupported file",
//           description: "Please drop an image file.",
//           variant: "destructive",
//         });
//       }
//     },
//     [toast, localPreview]
//   );

//   const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file && file.type.startsWith("image/")) {
//       setSelectedFile(file);
//       createLocalPreview(file);
//       toast({
//         title: "Image selected",
//         description: "Ready for analysis",
//         duration: 2500,
//       });
//     } else if (file) {
//       toast({
//         title: "Unsupported file",
//         description: "Please choose an image file.",
//         variant: "destructive",
//       });
//     }
//   };

//   // send file to backend, expect an image response (blob)
//   const handleAnalyze = async () => {
//     if (!selectedFile) {
//       toast({
//         title: "No image",
//         description: "Please upload an image before analyzing.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsAnalyzing(true);
//     toast({
//       title: "Analyzing image...",
//       description: "AI detection in progress",
//     });

//     try {
//       const fd = new FormData();
//       // IMPORTANT: server expects the field name "file"
//       fd.append("file", selectedFile);

//       const res = await fetch(BACKEND_URL, {
//         method: "POST",
//         body: fd,
//       });

//       if (!res.ok) {
//         const text = await res.text().catch(() => "");
//         throw new Error(`Server error: ${res.status} ${text}`);
//       }

//       const contentType = res.headers.get("content-type") || "";
//       if (contentType.includes("application/json")) {
//         const json = await res.json();
//         if (json.image && typeof json.image === "string") {
//           setProcessedImage(json.image);
//         } else if (json.image_base64 && typeof json.image_base64 === "string") {
//           const dataUri = json.image_base64.startsWith("data:")
//             ? json.image_base64
//             : `data:image/png;base64,${json.image_base64}`;
//           setProcessedImage(dataUri);
//         } else if (json.url && typeof json.url === "string") {
//           setProcessedImage(json.url);
//         } else {
//           throw new Error("Unexpected JSON response shape from server.");
//         }
//       } else if (contentType.startsWith("image/") || contentType === "") {
//         const blob = await res.blob();
//         if (processedImage && processedImage.startsWith("blob:")) {
//           URL.revokeObjectURL(processedImage);
//         }
//         const objectUrl = URL.createObjectURL(blob);
//         setProcessedImage(objectUrl);
//       } else {
//         // fallback: attempt to read as blob
//         const blob = await res.blob();
//         if (blob.size > 0) {
//           if (processedImage && processedImage.startsWith("blob:")) {
//             URL.revokeObjectURL(processedImage);
//           }
//           const objectUrl = URL.createObjectURL(blob);
//           setProcessedImage(objectUrl);
//         } else {
//           throw new Error("Empty response from server.");
//         }
//       }

//       toast({
//         title: "Analysis complete",
//         description: "Processed image received.",
//         duration: 2500,
//       });
//     } catch (err: any) {
//       console.error("Analyze error:", err);
//       toast({
//         title: "Analysis failed",
//         description: err?.message || "Something went wrong while analyzing.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   // cleanup object URLs on unmount
//   useEffect(() => {
//     return () => {
//       if (localPreview && localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview);
//       if (processedImage && processedImage.startsWith("blob:")) URL.revokeObjectURL(processedImage);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // run once on unmount

//   const clearSelection = () => {
//     if (localPreview && localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview);
//     if (processedImage && processedImage.startsWith("blob:")) URL.revokeObjectURL(processedImage);
//     setLocalPreview(null);
//     setProcessedImage(null);
//     setSelectedFile(null);
//     if (inputRef.current) inputRef.current.value = "";
//   };

//   const displayImage = processedImage ?? localPreview;

//   return (
//     <Card className="p-6 bg-gradient-to-br from-card to-accent-light/10 border-border shadow-lg">
//       <div className="flex items-center gap-3 mb-4">
//         <div className="p-2 bg-primary/10 rounded-lg">
//           <ImageIcon className="w-5 h-5 text-primary" />
//         </div>
//         <h2 className="text-2xl font-semibold text-foreground">Disease Detection</h2>
//       </div>

//       <div
//         onDrop={handleDrop}
//         onDragOver={(e) => {
//           e.preventDefault();
//           setIsDragging(true);
//         }}
//         onDragLeave={() => setIsDragging(false)}
//         className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
//           isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50"
//         }`}
//       >
//         {!displayImage ? (
//           <div className="text-center">
//             <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
//               <Upload className="w-8 h-8 text-primary" />
//             </div>
//             <h3 className="text-lg font-medium text-foreground mb-2">Upload Coffee Leaf Image</h3>
//             <p className="text-muted-foreground mb-4">Drag and drop or click to select an image</p>

//             <input
//               ref={inputRef}
//               type="file"
//               accept="image/*"
//               onChange={handleFileInput}
//               className="hidden"
//               id="file-upload"
//             />
//             <label htmlFor="file-upload">
//               <Button variant="default" className="cursor-pointer" asChild>
//                 <span>Select Image</span>
//               </Button>
//             </label>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div className="relative rounded-lg overflow-hidden">
//               <img
//                 src={displayImage}
//                 alt={processedImage ? "Processed result" : "Uploaded leaf"}
//                 className="w-full h-auto max-h-96 object-contain bg-muted"
//               />
//               <button
//                 onClick={clearSelection}
//                 className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
//                 title="Remove image"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <div className="flex gap-2">
//               <Button onClick={handleAnalyze} className="flex-1" size="lg" disabled={!selectedFile || isAnalyzing}>
//                 <CheckCircle className="mr-2 w-5 h-5" />
//                 {isAnalyzing ? "Analyzing..." : processedImage ? "Re-analyze" : "Analyze Disease"}
//               </Button>

//               <label htmlFor="file-upload">
//                 <Button variant="ghost" disabled={isAnalyzing}>
//                   Change
//                 </Button>
//               </label>
//             </div>
//           </div>
//         )}
//       </div>
//     </Card>
//   );
// };

// export default ImageUpload;
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = "http://localhost:8000/detect/image/yolo";

const ImageUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [detectedDiseases, setDetectedDiseases] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  // create local preview from file
  const createLocalPreview = (file: File) => {
    if (localPreview && localPreview.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    setProcessedImage(null);
    setDetectedDiseases([]);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        setSelectedFile(file);
        createLocalPreview(file);
        toast({
          title: "Image selected",
          description: "Ready for analysis",
          duration: 2500,
        });
      } else {
        toast({
          title: "Unsupported file",
          description: "Please drop an image file.",
          variant: "destructive",
        });
      }
    },
    [toast, localPreview]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      createLocalPreview(file);
      toast({
        title: "Image selected",
        description: "Ready for analysis",
        duration: 2500,
      });
    } else if (file) {
      toast({
        title: "Unsupported file",
        description: "Please choose an image file.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No image",
        description: "Please upload an image before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    toast({
      title: "Analyzing image...",
      description: "AI detection in progress",
    });

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server error: ${res.status} ${text}`);
      }

      const data = await res.json();

      // Expect data.image_base64 and data.diseases
      if (data.image_base64) {
        const dataUri = `data:image/jpeg;base64,${data.image_base64}`;
        // revoke previous processedImage blob URI if needed (we use data URI here, so no revoke)
        setProcessedImage(dataUri);
      } else {
        setProcessedImage(null);
      }

      if (data.diseases && Array.isArray(data.diseases)) {
        setDetectedDiseases(data.diseases);
      } else {
        setDetectedDiseases([]);
      }

      toast({
        title: "Analysis complete",
        description: detectedDiseases.length > 0 ? `Detected: ${data.diseases.join(", ")}` : "No diseases detected",
        duration: 2500,
      });
    } catch (err: any) {
      console.error("Analyze error:", err);
      toast({
        title: "Analysis failed",
        description: err?.message || "Something went wrong while analyzing.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on unmount

  const clearSelection = () => {
    if (localPreview && localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setProcessedImage(null);
    setSelectedFile(null);
    setDetectedDiseases([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayImage = processedImage ?? localPreview;

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-accent-light/10 border-border shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ImageIcon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Disease Detection</h2>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
          isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50"
        }`}
      >
        {!displayImage ? (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Upload Coffee Leaf Image</h3>
            <p className="text-muted-foreground mb-4">Drag and drop or click to select an image</p>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="default" className="cursor-pointer" asChild>
                <span>Select Image</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={displayImage}
                alt={processedImage ? "Processed result" : "Uploaded leaf"}
                className="w-full h-auto max-h-96 object-contain bg-muted"
              />
              <button
                onClick={clearSelection}
                className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Show diseases if available */}
            {detectedDiseases.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Detected Diseases</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {detectedDiseases.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleAnalyze} className="flex-1" size="lg" disabled={!selectedFile || isAnalyzing}>
                <CheckCircle className="mr-2 w-5 h-5" />
                {isAnalyzing ? "Analyzing..." : processedImage ? "Re-analyze" : "Analyze Disease"}
              </Button>

              <label htmlFor="file-upload">
                <Button variant="ghost" disabled={isAnalyzing}>
                  Change
                </Button>
              </label>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImageUpload;
