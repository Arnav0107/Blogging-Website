import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import { storeInSession } from "../common/session";

const EditProfile = () => {
  const { userAuth, setUserAuth } = useContext(UserContext);

  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profileImg, setProfileImg] = useState("");
  const [publicId, setPublicId] = useState("");
  const [loading, setLoading] = useState(true);
  const [social, setSocial] = useState({
    youtube: "",
    instagram: "",
    facebook: "",
    twitter: "",
    github: "",
    website: "",
  });

  // ✅ Fetch fresh from DB on mount using the JWT id
  useEffect(() => {
    if (!userAuth?.access_token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/user/me`,
          {
            headers: {
              Authorization: `Bearer ${userAuth.access_token}`,
            },
          }
        );
        const data = await res.json();
        if (!res.ok) return toast.error(data.message || "Failed to load profile");

        const u = data.user;
        setFullname(u.personal_info.fullname || "");
        setUsername(u.personal_info.username || "");
        setEmail(u.personal_info.email || "");
        setBio(u.personal_info.bio || "");
        setProfileImg(u.personal_info.profile_img || "");
        setSocial(
          u.social_links || {
            youtube: "",
            instagram: "",
            facebook: "",
            twitter: "",
            github: "",
            website: "",
          }
        );
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userAuth?.access_token]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/upload-image`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Upload failed");

      setProfileImg(data.imageUrl);
      setPublicId(data.public_id);
      toast.success("Picture updated!");
    } catch (err) {
      toast.error("Image upload failed");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/user/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userAuth.access_token}`,
          },
          body: JSON.stringify({
            bio,
            profile_img: profileImg,
            social_links: social,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Update failed");

      // ✅ Update session so navbar profile pic and name stay in sync
      const updatedUser = {
        ...userAuth,
        bio,
        profile_img: profileImg,
        social_links: social,
      };
      storeInSession("user", JSON.stringify(updatedUser));
      setUserAuth(updatedUser);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-20 text-dark-grey animate-pulse">
        Loading profile...
      </div>
    );
  }

  return (
    <div>
      <Toaster />
      <h1 className="text-2xl font-medium mb-8">Edit Profile</h1>

      <div className="flex gap-10 max-md:flex-col">
        {/* LEFT — profile pic */}
        <div className="flex flex-col items-center gap-4 flex-none">
          <img
            src={profileImg}
            alt="profile"
            className="w-36 h-36 rounded-full object-cover"
          />
          <label
            htmlFor="uploadPic"
            className="btn-light py-2 px-6 cursor-pointer"
          >
            Upload
          </label>
          <input
            type="file"
            id="uploadPic"
            accept=".png,.jpg,.jpeg"
            hidden
            onChange={handleImageUpload}
          />
        </div>

        {/* RIGHT — form */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Full name + Email — locked */}
          <div className="flex gap-4 max-md:flex-col">
            <div className="relative flex-1">
              <i className="fi fi-rr-user absolute left-3 top-1/2 -translate-y-1/2 text-dark-grey" />
              <input
                type="text"
                value={fullname}
                disabled
                className="w-full bg-grey pl-10 pr-4 py-3 rounded outline-none opacity-60 cursor-not-allowed"
              />
            </div>
            <div className="relative flex-1">
              <i className="fi fi-rr-envelope absolute left-3 top-1/2 -translate-y-1/2 text-dark-grey" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-grey pl-10 pr-4 py-3 rounded outline-none opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Username — locked */}
          <div className="relative">
            <i className="fi fi-rr-at absolute left-3 top-1/2 -translate-y-1/2 text-dark-grey" />
            <input
              type="text"
              value={username}
              disabled
              className="w-full bg-grey pl-10 pr-4 py-3 rounded outline-none opacity-60 cursor-not-allowed"
            />
          </div>
          <p className="text-sm text-dark-grey -mt-2">
            Username will use to search user and will be visible to all users
          </p>

          {/* Bio */}
          <textarea
            value={bio}
            onChange={(e) => {
              if (e.target.value.length <= 200) setBio(e.target.value);
            }}
            placeholder="Bio"
            rows={5}
            className="w-full bg-grey p-4 rounded outline-none resize-none"
          />
          <p className="text-sm text-dark-grey -mt-2">
            {200 - bio.length} characters left
          </p>

          {/* Social links */}
          <p className="mt-2">Add Your Social Handles below</p>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {[
              { key: "youtube",   icon: "fi-brands-youtube"   },
              { key: "instagram", icon: "fi-brands-instagram"  },
              { key: "facebook",  icon: "fi-brands-facebook"   },
              { key: "twitter",   icon: "fi-brands-twitter"    },
              { key: "github",    icon: "fi-brands-github"     },
              { key: "website",   icon: "fi-rr-link"           },
            ].map(({ key, icon }) => (
              <div key={key} className="relative">
                <i
                  className={`fi ${icon} absolute left-3 top-1/2 -translate-y-1/2 text-dark-grey`}
                />
                <input
                  type="url"
                  value={social[key]}
                  onChange={(e) =>
                    setSocial({ ...social, [key]: e.target.value })
                  }
                  placeholder="https://"
                  className="w-full bg-grey pl-10 pr-4 py-3 rounded outline-none"
                />
              </div>
            ))}
          </div>

          <button
            className="btn-dark py-3 px-8 rounded-full w-fit mt-4"
            onClick={handleUpdate}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;