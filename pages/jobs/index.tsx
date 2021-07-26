import 'react-quill/dist/quill.snow.css';
import { get } from 'js-cookie';
import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { AllJobs } from '../../Components/AllJobs';
import Layout from '../../Components/Layout';
import { getExperience, getRegions } from '../../util/database';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

type Props = {
  username?: string;
  experience: Exp[];
  regions: Region[];
  allJobs: any;
  allJobsByValidSessionUser: any;
};

type Exp = {
  id: number;
  title: string;
};

type Region = {
  id: number;
  title: string;
};

export default function Jobs(props: Props) {
  const [title, setTitle] = useState('');
  const [regionId, setRegionId] = useState('');
  const [details, setDetails] = useState('');
  const [pay, setPay] = useState('');
  const [expId, setExpId] = useState('');
  const [errors, setErrors] = useState<any[]>();
  const router = useRouter();
  const [allJobs, setAllJobs] = useState(props.allJobs);
  const [regTitle, setRegTitle] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [day, setDay] = useState('');
  const [dayy, setDayy] = useState('');

  // Handle click on "Select By Category" Button

  // console.log(props.allJobs);

  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  async function clickHandler() {
    const response = await fetch(`/api/jobs/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // send the request body to the API route
      body: JSON.stringify({
        title: title,
        regionId: Number(regionId),
        expId: Number(expId),
        pay: pay,
        details: details,
        day: day,
      }),
    });

    const {
      errors: [errorMessage],
    } = await response.json();

    // Check if there is an errorMessage inside the json and update state
    if (errorMessage) {
      // console.log('error in create.tsx', errorMessage);
      setErrors(errorMessage);
      return;
    }
    router.push(`/jobs`);
  }

  let clearAllFilters = () => {
    setDayy(''), setExpTitle(''), setRegTitle('');
  };

  return (
    <div>
      <Head>
        <title>{props.username}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout username={props.username} />
      <div className="jobs-page">
        <div>
          {props.username ? (
            <div className="my-jobs-section">
              <h2>My Posts</h2>
              <Button color="success" onClick={toggle}>
                Post a Job
              </Button>
              <Modal isOpen={modal} toggle={toggle} fade={false}>
                <ModalHeader toggle={toggle} className="modal-title">
                  Add Job
                </ModalHeader>
                <ModalBody>
                  <Form>
                    <Input
                      value={title}
                      required
                      placeholder="Job Title"
                      bsSize="lg"
                      onChange={(event) => {
                        setTitle(event.currentTarget.value);
                      }}
                    />
                    <Input
                      className="calendar-modal"
                      type="date"
                      placeholder="dd/mm/yyyy"
                      value={day}
                      required
                      onChange={(event) => {
                        setDay(event.currentTarget.value);
                      }}
                    ></Input>
                    <Input
                      type="select"
                      value={regionId}
                      onChange={(event) => {
                        setRegionId(event.currentTarget.value);
                      }}
                    >
                      <option value="">Select Region</option>
                      {props.regions.map((region) => {
                        return (
                          <option key={region.id} value={region.id}>
                            {region.title}
                          </option>
                        );
                      })}
                    </Input>
                    <Input
                      type="select"
                      value={expId}
                      onChange={(event) => {
                        setExpId(event.currentTarget.value);
                      }}
                    >
                      <option value="">Experience Level</option>
                      {props.experience.map((exp) => {
                        return (
                          <option key={exp.id} value={exp.id}>
                            {exp.title}
                          </option>
                        );
                      })}
                    </Input>

                    <Input
                      value={pay}
                      required
                      placeholder="Pay"
                      onChange={(event) => {
                        setPay(event.currentTarget.value);
                      }}
                    />

                    <ReactQuill
                      className="quill"
                      value={details}
                      placeholder="Details"
                      onChange={setDetails}
                    />
                  </Form>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    onClick={() => {
                      clickHandler();
                      toggle();
                    }}
                  >
                    Post it
                  </Button>{' '}
                  <Button color="secondary" onClick={toggle}>
                    Cancel
                  </Button>
                </ModalFooter>
              </Modal>
              <div className="row">
                {props.allJobsByValidSessionUser.map(
                  (job: any, index: number) => {
                    return (
                      <div className="col-sm-5" key={job.id}>
                        <div className="card">
                          <h2 className="card-header">{job.title}</h2>
                          <div className="card-body">
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <div style={{ display: 'flex' }}>
                                {
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    className="card-text"
                                    id="location"
                                    src="/hsp.png"
                                    alt="location"
                                  ></img>
                                }
                                <h5 className="card-title"> {job.username}</h5>
                              </div>
                              <div style={{ display: 'flex' }}>
                                {
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    className="card-text"
                                    id="exp-icon"
                                    src="/exp.png"
                                    alt="experience icon"
                                  ></img>
                                }
                                <p className="card-text">
                                  {job.experienceTitle}
                                </p>
                              </div>
                            </div>
                            <div className="card-det">
                              <div style={{ display: 'flex' }}>
                                {
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    className="card-text"
                                    id="location"
                                    src="/loc.png"
                                    alt="location"
                                  ></img>
                                }
                                <p className="card-text">{job.regionsTitle}</p>
                              </div>
                              <div style={{ display: 'flex' }}>
                                {
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    className="card-text"
                                    id="location"
                                    src="/calendar.png"
                                    alt="location"
                                  ></img>
                                }
                                <p>{job.day}</p>
                              </div>
                            </div>
                            <div
                              style={{
                                textAlign: 'center',
                                marginBottom: '0.5em',
                              }}
                            >
                              <Link
                                href={`http://localhost:3000/jobs/${job.id}`}
                              >
                                <a className="see-job">See Job</a>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>{' '}
            </div>
          ) : (
            <div>
              <div className="filter">
                <h3 className="all-jobs-text">All Jobs</h3>
                <AllJobs
                  options={props.regions}
                  value={regTitle}
                  filterSetter={setRegTitle}
                  placeholder="Region"
                />
                <AllJobs
                  options={props.experience}
                  value={expTitle}
                  filterSetter={setExpTitle}
                  placeholder="Experience"
                />
                <Input
                  className="select-date"
                  type="date"
                  placeholder="dd/mm/yyyy"
                  value={dayy}
                  required
                  onChange={(event) => {
                    setDayy(event.currentTarget.value);
                  }}
                ></Input>
                <button onClick={clearAllFilters} className="clear-filters">
                  Clear All Filters
                </button>
              </div>
              <div className="container row" style={{ position: 'inherit' }}>
                {allJobs
                  .filter((job: any) => {
                    let isVisible = true;
                    if (regTitle && regTitle !== job.regionsTitle) {
                      isVisible = false;
                    }
                    if (expTitle && expTitle !== job.experienceTitle) {
                      isVisible = false;
                    }
                    if (dayy && dayy !== job.day) {
                      isVisible = false;
                    }
                    return isVisible;
                  })
                  .map((job: any) => {
                    return (
                      <div className="col-sm-5" key={job.id}>
                        <div className="card">
                          <h2 className="card-header">{job.title}</h2>
                          <div className="card-body">
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <div style={{ display: 'flex' }}>
                                {
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    className="card-text"
                                    id="location"
                                    src="/hsp.png"
                                    alt="location"
                                  ></img>
                                }
                                <h5 className="card-title"> {job.username}</h5>
                              </div>
                              <div style={{ display: 'flex' }}>
                                {
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    className="card-text"
                                    id="exp-icon"
                                    src="/exp.png"
                                    alt="experience icon"
                                  ></img>
                                }
                                <p className="card-text">
                                  {job.experienceTitle}
                                </p>
                              </div>
                            </div>
                            <div className="card-det">
                              <div style={{ display: 'flex' }}>
                                {
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    className="card-text"
                                    id="location"
                                    src="/loc.png"
                                    alt="location"
                                  ></img>
                                }
                                <p className="card-text">{job.regionsTitle}</p>
                              </div>
                              <div style={{ display: 'flex' }}>
                                {
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    className="card-text"
                                    id="location"
                                    src="/calendar.png"
                                    alt="location"
                                  ></img>
                                }
                                <p>{job.day}</p>
                              </div>
                            </div>
                            <div
                              style={{
                                textAlign: 'center',
                                marginBottom: '0.5em',
                              }}
                            >
                              <Link
                                href={`http://localhost:3000/jobs/${job.id}`}
                              >
                                <a className="see-job">See Job</a>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div className="col-sm-5"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const response = await fetch(`${process.env.API_BASE_URL}/jobs`, {
    method: 'GET',
    headers: {
      cookie: context.req.headers.cookie || '',
    },
  });

  // Wait for the response of the fetch inside /jobs/index.ts and then transform it into json
  const json = await response.json();
  //console.log('API decoded JSON from response', json.allJobsByValidSessionUser);
  const regions = await getRegions();
  const experience = await getExperience();

  return {
    props: { ...json, regions, experience },
  };
}
