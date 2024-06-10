import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import Header from "../components/Header";
import { UserContext, UserDocContext } from "../services/context";
import Map from "../components/Map";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import InfoCard from "../components/InfoCard";
import Footer from "../components/Footer";
import _ from "lodash";
import { auth, db } from "../services/firebase";
import BlankInfoCard from "../components/BlankInfoCard";

function MangeListings() {
  const [listings, setListings] = useState([]);
  const { user, setUser } = useContext(UserContext);
  const { userDoc, setUserDoc } = useContext(UserDocContext);
  const [filter, setFilter] = useState({ path: "price", order: "asc" });
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(async () => {
    if (userDoc?.listings?.length > 0) {
      const listings1 = [];

      for (let roomId of userDoc?.listings) {
        const room = await db
          .collection("listings")
          .doc(roomId)
          .get()
          .then((item) => item.data());

        if (room) listings1.push(room);
        else {
          const index = userDoc?.listings?.indexOf(roomId);
          const listings2 = [...userDoc.listings];
          listings2.splice(index, 1);
          const userDoc1 = { ...userDoc };
          userDoc1.listings = listings2;
          setUserDoc(userDoc1);
        }
      }
      setListings(listings1);
      setReady(true);
    }
    if (userDoc && userDoc.listings.length == 0) {
      setReady(true);
    }
  }, [userDoc]);

  useEffect(() => {
    const listings1 = _.orderBy(listings, [filter.path], [filter.order]);
    setListings(listings1);
  }, [filter]);

  const handleSort = (type) => {
    const filter1 = { ...filter };
    filter1.path = type;
    filter1.order = filter1.order === "asc" ? "desc" : "asc";
    setFilter(filter1);
  };

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
      } else {
        setReady(true);
      }
    });
  }, []);

  return (
    <div>
      <Head>
        <title>Manage Listings</title>
        <link
          rel="icon"
          href="https://ebenezersuites.com/wp-content/uploads/2016/06/airbnb-logo.png"
        />
      </Head>

      <Header />

      {ready ? (
        user ? (
          listings.length > 0 ? (
            <main>
              <section className="flex lg:hidden h-[65vh] vw-[100vw] fixed w-full top-0 z-[0]">
                <Map searchResults={listings} fromWishlist />
              </section>
              <main className="grid lg:grid-cols-3 z-[40] bg-white">
                <section className="flex-grow absolute lg:col-span-2 lg:pt-8 lg:static top-[57vh] xl:pt-6 px-6 bg-white rounded-t-[1.7rem] z-[40]">
                  <div className="w-full flex justify-center pt-2 lg:hidden mb-6">
                    <span className="border-t-2 border-gray-500 p-1 w-[30%] fill-gray-500 h-[0.5px]"></span>
                  </div>
                  <ArrowLeftIcon
                    onClick={() => router.back()}
                    className="h-6 cursor-pointer mb-6"
                  />
                  <h2 className="block text-3xl font-[400] text-[#222222] mt-4 mb-3">
                    Listings
                  </h2>
                  <div className="py-5 inline-flex items-center mb-5 sm:space-x-3 sm:m-0 sm:p-4 text-gray-800 flex-wrap max-h-[150px] overflow-hidden">
                    <p onClick={() => handleSort("price")} className="button">
                      Price
                    </p>
                  </div>
                  <div className="flex flex-col max-w-full py-2 z-[40] mb-10">
                    {listings?.map((item) => (
                      <InfoCard item={item} listings />
                    ))}
                  </div>
                </section>
                <section className="hidden lg:inline-flex h-[85vh] sticky top-[7.1rem]">
                  <Map searchResults={listings} fromWishlist />
                </section>
              </main>
            </main>
          ) : (
            <main className="flex flex-col space-y-10 justify-center items-center py-40 px-4">
              <h1 className="text-2xl font-[500] text-[#222222]">
                You have no Listings. To make a new one click "Become a host".
              </h1>
              <button
                className="py-4 px-6 text-xl font-[500] hover:bg-black rounded-full bg-gray-900 text-white"
                onClick={() => router.push("/become-a-host")}
              >
                Become a host
              </button>
            </main>
          )
        ) : (
          <main className="flex justify-center items-center py-48 px-4">
            <h1 className="text-[1.75rem] font-[500] text-[#222222]">
              You have to Login to have listings
            </h1>
          </main>
        )
      ) : (
        <main className="grid grid-room h-[80vh]">
          <div className="w-full h-full pt-12 px-6">
            <div className="w-3/4 lg:w-[55%] h-8 bg-gray-200"></div>
            <div className="w-1/2 lg:w-1/3 h-5 bg-gray-200 mt-2"></div>
            <div className="w-full flex flex-col gap-5 mt-7">
              <BlankInfoCard />
              <BlankInfoCard />
              <BlankInfoCard />
            </div>
          </div>
          <div className="w-full h-full hidden lg:flex bg-gray-200"></div>
        </main>
      )}

      {ready && (
        <footer className="hidden lg:flex">
          <Footer />
        </footer>
      )}
    </div>
  );
}

export default MangeListings;
