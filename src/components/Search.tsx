import React, { useState, useEffect, useCallback } from 'react';

import { Container, Row, Col } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

import ManifestJson from '../serialization/ManifestJson';
import SearchResultsJson from '../serialization/SearchResultsJson';
import CopyToClipboardHandler from './CopyToClipboardHandler';
import SearchBar from './SearchBar';
import SearchPagination from './SearchPagination';
import SearchProcessor from './SearchProcessor';
import SearchResult from './SearchResult';

const RESULTS_PER_PAGE = 20;

const Search = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getQueryFromSearchParams = useCallback((): string => {
    return searchParams.get('q') ?? '';
  }, [searchParams]);

  const getCurrentPageFromSearchParams = useCallback((): number => {
    return parseInt(searchParams.get('p') || '1', 10);
  }, [searchParams]);

  const getSortIndexFromSearchParams = useCallback((): number => {
    return parseInt(searchParams.get('s') || '0', 10);
  }, [searchParams]);

  const getSearchOfficialOnlyFromSearchParams = useCallback((): boolean => {
    return searchParams.get('o') === 'true';
  }, [searchParams]);

  const updateSearchParams = useCallback(
    (name: string, value: string, shouldSet: () => boolean): void => {
      if (shouldSet()) {
        searchParams.set(name, value);
      } else {
        searchParams.delete(name);
      }

      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const [searchBarQuery, setSearchBarQuery] = useState<string>(getQueryFromSearchParams);
  const [query, setQuery] = useState<string>(getQueryFromSearchParams);
  const [currentPage, setCurrentPage] = useState<number>(getCurrentPageFromSearchParams);
  const [sortIndex, setSortIndex] = useState<number>(getSortIndexFromSearchParams);
  const [searchOfficialOnly, setSearchOfficialOnly] = useState<boolean>(getSearchOfficialOnlyFromSearchParams);
  const [searchResults, setSearchResults] = useState<SearchResultsJson>();
  const [contentToCopy, setContentToCopy] = useState<string>();

  useEffect(() => {
    const queryfromSearchParams = getQueryFromSearchParams();
    setSearchBarQuery(queryfromSearchParams);
    setQuery(queryfromSearchParams);
  }, [getQueryFromSearchParams]);

  useEffect(() => {
    setCurrentPage(getCurrentPageFromSearchParams());
  }, [getCurrentPageFromSearchParams]);

  const handleQueryChange = useCallback(
    (newQuery: string): void => {
      updateSearchParams('q', newQuery, () => newQuery.length > 0);
      setSearchBarQuery(newQuery);
      setCurrentPage(1);
    },
    [updateSearchParams]
  );

  const handleQuerySubmit = useCallback((): void => {
    setQuery(searchBarQuery);
  }, [searchBarQuery]);

  const handleResultsChange = useCallback((e?: SearchResultsJson): void => {
    setSearchResults(e);
  }, []);

  const handlePageChange = useCallback(
    (newCurrentPage: number): void => {
      updateSearchParams('p', newCurrentPage.toString(), () => newCurrentPage > 1);
      setCurrentPage(newCurrentPage);
      window.scrollTo(0, 0);
    },
    [updateSearchParams]
  );

  const handleSortChange = useCallback(
    (newSortIndex: number): void => {
      updateSearchParams('s', newSortIndex.toString(), () => newSortIndex > 0);
      setSortIndex(newSortIndex);
    },
    [updateSearchParams]
  );

  const handleSearchOfficialOnlyChange = useCallback(
    (newSearchOfficialOnly: boolean): void => {
      updateSearchParams('o', newSearchOfficialOnly.toString(), () => newSearchOfficialOnly);
      setSearchOfficialOnly(newSearchOfficialOnly);
    },
    [updateSearchParams]
  );

  const handleCopyToClipboard = useCallback((newContentToCopy: string): void => {
    setContentToCopy(newContentToCopy);
  }, []);

  const handleContentCopied = useCallback((): void => {
    setContentToCopy(undefined);
  }, []);

  return (
    <div className="Search">
      <CopyToClipboardHandler content={contentToCopy} onContentCopied={handleContentCopied} />

      <Container className="mt-5 mb-5">
        <Row className="justify-content-center">
          <Col sm={8}>
            <SearchBar query={searchBarQuery} onQueryChange={handleQueryChange} onSubmit={handleQuerySubmit} />
          </Col>
        </Row>

        <Row className="mt-5 mb-1">
          <Col>
            <SearchProcessor
              resultsPerPage={RESULTS_PER_PAGE}
              page={currentPage}
              query={query}
              sortIndex={sortIndex}
              searchOfficialOnly={searchOfficialOnly}
              onResultsChange={handleResultsChange}
              onSortIndexChange={handleSortChange}
              onSearchOfficialOnlyChange={handleSearchOfficialOnlyChange}
            />
          </Col>
        </Row>

        <Row className="mt-2">
          <Col>
            {searchResults?.results.map((searchResult: ManifestJson) => (
              <SearchResult key={searchResult.id} result={searchResult} onCopyToClipbard={handleCopyToClipboard} />
            ))}
          </Col>
        </Row>

        <Row>
          <Col className="d-flex justify-content-center">
            <SearchPagination
              resultsPerPage={RESULTS_PER_PAGE}
              currentPage={currentPage}
              resultsCount={searchResults?.count ?? 0}
              onPageChange={handlePageChange}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default React.memo(Search);
